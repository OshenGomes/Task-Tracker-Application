using Microsoft.AspNetCore.Mvc;
using Task_Tracker_Application.Application.Dtos;
using Task_Tracker_Application.Application.Interfaces;
using Task_Tracker_Application.Domain.Entities;

namespace Task_Tracker_Application.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly ITaskRepository _taskRepository;

    public TasksController(ITaskRepository taskRepository)
    {
        _taskRepository = taskRepository;
    }

    [HttpGet]
    public ActionResult<object> GetAll(
        [FromQuery] int? page,
        [FromQuery] int? pageSize,
        [FromQuery] int? pageNumber,
        [FromQuery] int? size,
        [FromQuery] string? status,
        [FromQuery] int? owner)
    {
        var (role, currentUserId, isAdmin) = GetCurrentUserContext();
        var effectivePageNumber = pageNumber ?? page ?? 1;
        var effectivePageSize = size ?? pageSize ?? 10;

        if (effectivePageNumber < 1 || effectivePageSize < 1)
        {
            return BadRequest("pageNumber/page and pageSize/size must be greater than 0.");
        }

        var query = _taskRepository.GetAll().AsQueryable();

        if (!isAdmin)
        {
            if (!currentUserId.HasValue)
            {
                return Forbid();
            }

            query = query.Where(t => t.AssignedToUserId == currentUserId.Value);
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            if (!Enum.TryParse<Domain.Entities.TaskStatus>(status, true, out var parsedStatus))
            {
                return BadRequest("status must be one of: ToDo, InProgress, Completed.");
            }

            query = query.Where(t => t.Status == parsedStatus);
        }

        if (owner.HasValue)
        {
            if (owner.Value < 1)
            {
                return BadRequest("owner must be a positive user id.");
            }

            if (!isAdmin)
            {
                if (!currentUserId.HasValue || owner.Value != currentUserId.Value)
                {
                    return Forbid();
                }
            }

            query = query.Where(t => t.AssignedToUserId == owner.Value);
        }

        var totalCount = query.Count();
        var tasks = query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((effectivePageNumber - 1) * effectivePageSize)
            .Take(effectivePageSize)
            .Select(MapToDto)
            .ToList();

        return Ok(new
        {
            items = tasks,
            pageNumber = effectivePageNumber,
            pageSize = effectivePageSize,
            totalCount,
            totalPages = (int)Math.Ceiling(totalCount / (double)effectivePageSize)
        });
    }

    [HttpGet("{id:int}")]
    public ActionResult<TaskDto> GetById(int id)
    {
        var (role, currentUserId, isAdmin) = GetCurrentUserContext();
        var task = _taskRepository.GetById(id);
        if (task is null)
        {
            return NotFound();
        }

        if (!isAdmin && (!currentUserId.HasValue || task.AssignedToUserId != currentUserId.Value))
        {
            return Forbid();
        }

        return Ok(MapToDto(task));
    }

    [HttpPost]
    public ActionResult<TaskDto> Create([FromBody] CreateTaskRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var (role, currentUserId, isAdmin) = GetCurrentUserContext();
        if (!isAdmin)
        {
            if (!currentUserId.HasValue)
            {
                return Forbid();
            }

            if (request.AssignedToUserId.HasValue && request.AssignedToUserId != currentUserId.Value)
            {
                return Forbid();
            }
        }

        var task = new TaskItem
        {
            Title = request.Title,
            Description = request.Description,
            Status = Enum.TryParse<Domain.Entities.TaskStatus>(request.Status, true, out var status) ? status : Domain.Entities.TaskStatus.ToDo,
            Priority = Enum.TryParse<Domain.Entities.TaskPriority>(request.Priority, true, out var priority) ? priority : Domain.Entities.TaskPriority.Medium,
            DueDate = request.DueDate,
            AssignedToUserId = isAdmin ? request.AssignedToUserId : currentUserId,
            Tags = request.Tags,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var createdTask = _taskRepository.Create(task);
        return CreatedAtAction(nameof(GetById), new { id = createdTask.Id }, MapToDto(createdTask));
    }

    [HttpPut("{id:int}")]
    public IActionResult Update(int id, [FromBody] CreateTaskRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var (role, currentUserId, isAdmin) = GetCurrentUserContext();
        var task = _taskRepository.GetById(id);
        if (task is null)
        {
            return NotFound();
        }

        if (!isAdmin && (!currentUserId.HasValue || task.AssignedToUserId != currentUserId.Value))
        {
            return Forbid();
        }

        if (!isAdmin && request.AssignedToUserId.HasValue && request.AssignedToUserId != currentUserId.Value)
        {
            return Forbid();
        }

        var assignedUserId = isAdmin ? request.AssignedToUserId : currentUserId;

        task.Title = request.Title;
        task.Description = request.Description;
        task.Status = Enum.TryParse<Domain.Entities.TaskStatus>(request.Status, true, out var status) ? status : Domain.Entities.TaskStatus.ToDo;
        task.Priority = Enum.TryParse<Domain.Entities.TaskPriority>(request.Priority, true, out var priority) ? priority : Domain.Entities.TaskPriority.Medium;
        task.DueDate = request.DueDate;
        task.AssignedToUserId = assignedUserId;
        task.Tags = request.Tags;
        task.UpdatedAt = DateTime.UtcNow;

        _taskRepository.Update(task);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public IActionResult Delete(int id)
    {
        var (role, currentUserId, isAdmin) = GetCurrentUserContext();
        var task = _taskRepository.GetById(id);
        if (task is null)
        {
            return NotFound();
        }

        if (!isAdmin && (!currentUserId.HasValue || task.AssignedToUserId != currentUserId.Value))
        {
            return Forbid();
        }

        _taskRepository.Delete(task);
        return NoContent();
    }

    private (string? Role, int? UserId, bool IsAdmin) GetCurrentUserContext()
    {
        var role = Request.Headers["X-User-Role"].ToString();
        var userIdHeader = Request.Headers["X-User-Id"].ToString();
        int? userId = int.TryParse(userIdHeader, out var parsedUserId) ? parsedUserId : null;
        return (role, userId, string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase));
    }

    private static TaskDto MapToDto(TaskItem task) => new()
    {
        Id = task.Id,
        Title = task.Title,
        Description = task.Description,
        Status = task.Status.ToString(),
        Priority = task.Priority.ToString(),
        DueDate = task.DueDate,
        CreatedAt = task.CreatedAt,
        UpdatedAt = task.UpdatedAt,
        AssignedToUserId = task.AssignedToUserId,
        Tags = task.Tags
    };
}

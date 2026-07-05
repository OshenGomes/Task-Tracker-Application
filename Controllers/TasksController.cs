using Microsoft.AspNetCore.Mvc;
using Task_Tracker_Application.Data;
using Task_Tracker_Application.Models;

namespace Task_Tracker_Application.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private static readonly TaskTrackerDbContext _dbContext = new();

    [HttpGet]
    public ActionResult<IEnumerable<TaskItem>> GetAll() => Ok(_dbContext.Tasks);

    [HttpGet("{id:int}")]
    public ActionResult<TaskItem> GetById(int id)
    {
        var task = _dbContext.Tasks.FirstOrDefault(t => t.Id == id);
        return task is null ? NotFound() : Ok(task);
    }

    [HttpPost]
    public ActionResult<TaskItem> Create(TaskItem task)
    {
        task.Id = _dbContext.Tasks.Count + 1;
        task.CreatedAt = DateTime.UtcNow;
        task.UpdatedAt = DateTime.UtcNow;
        _dbContext.Tasks.Add(task);
        return CreatedAtAction(nameof(GetById), new { id = task.Id }, task);
    }
}

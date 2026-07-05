using Microsoft.AspNetCore.Mvc;
using Task_Tracker_Application.Application.Dtos;
using Task_Tracker_Application.Application.Interfaces;
using Task_Tracker_Application.Domain.Entities;

namespace Task_Tracker_Application.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserRepository _userRepository;

    public UsersController(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    [HttpGet]
    public ActionResult<IEnumerable<UserDto>> GetAll()
    {
        var users = _userRepository.GetAll().Select(MapToDto);
        return Ok(users);
    }

    [HttpGet("{id:int}")]
    public ActionResult<UserDto> GetById(int id)
    {
        var user = _userRepository.GetById(id);
        if (user is null)
        {
            return NotFound();
        }

        return Ok(MapToDto(user));
    }

    [HttpPost]
    public ActionResult<UserDto> Create([FromBody] CreateUserRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var user = new User
        {
            Name = request.Name,
            Email = request.Email,
            Role = NormalizeRole(request.Role),
            CreatedAt = DateTime.UtcNow
        };

        var createdUser = _userRepository.Create(user);
        return CreatedAtAction(nameof(GetById), new { id = createdUser.Id }, MapToDto(createdUser));
    }

    [HttpPut("{id:int}")]
    public IActionResult Update(int id, [FromBody] UpdateUserRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var user = _userRepository.GetById(id);
        if (user is null)
        {
            return NotFound();
        }

        user.Name = request.Name;
        user.Email = request.Email;
        user.Role = NormalizeRole(request.Role);
        _userRepository.Update(user);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public IActionResult Delete(int id)
    {
        var user = _userRepository.GetById(id);
        if (user is null)
        {
            return NotFound();
        }

        _userRepository.Delete(user);
        return NoContent();
    }

    private static UserDto MapToDto(User user) => new()
    {
        Id = user.Id,
        Name = user.Name,
        Email = user.Email,
        Role = NormalizeRole(user.Role),
        CreatedAt = user.CreatedAt
    };

    private static string NormalizeRole(string? role) => string.IsNullOrWhiteSpace(role) ? "user" : role.Trim().ToLowerInvariant();
}

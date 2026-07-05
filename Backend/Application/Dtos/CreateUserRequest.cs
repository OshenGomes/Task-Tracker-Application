using System.ComponentModel.DataAnnotations;

namespace Task_Tracker_Application.Application.Dtos;

public class CreateUserRequest
{
    [Required(ErrorMessage = "Name is required")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 100 characters")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "A valid email address is required")]
    public string Email { get; set; } = string.Empty;

    [StringLength(50, ErrorMessage = "Role must not exceed 50 characters")]
    public string Role { get; set; } = "Member";
}

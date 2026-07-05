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

    [Required(ErrorMessage = "Role is required")]
    [RegularExpression("^(user|admin)$", ErrorMessage = "Role must be either 'user' or 'admin'")]
    public string Role { get; set; } = "user";
}

using Task_Tracker_Application.Domain.Entities;

namespace Task_Tracker_Application.Application.Interfaces;

public interface IUserRepository
{
    IEnumerable<User> GetAll();
    User? GetById(int id);
    User Create(User user);
    void Update(User user);
    void Delete(User user);
}

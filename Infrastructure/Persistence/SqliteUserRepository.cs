using Task_Tracker_Application.Application.Interfaces;
using Task_Tracker_Application.Domain.Entities;

namespace Task_Tracker_Application.Infrastructure.Persistence;

public class SqliteUserRepository : IUserRepository
{
    private readonly TaskTrackerDbContext _context;

    public SqliteUserRepository(TaskTrackerDbContext context)
    {
        _context = context;
    }

    public IEnumerable<User> GetAll() => _context.Users.ToList();

    public User? GetById(int id) => _context.Users.Find(id);

    public User Create(User user)
    {
        _context.Users.Add(user);
        _context.SaveChanges();
        return user;
    }

    public void Update(User user)
    {
        _context.Users.Update(user);
        _context.SaveChanges();
    }

    public void Delete(User user)
    {
        _context.Users.Remove(user);
        _context.SaveChanges();
    }
}

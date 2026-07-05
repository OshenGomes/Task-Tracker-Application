using Microsoft.EntityFrameworkCore;
using Task_Tracker_Application.Domain.Entities;

namespace Task_Tracker_Application.Infrastructure.Persistence;

public class TaskTrackerDbContext : DbContext
{
    public TaskTrackerDbContext(DbContextOptions<TaskTrackerDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<TaskItem> Tasks => Set<TaskItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>().HasKey(u => u.Id);
        modelBuilder.Entity<User>().Property(u => u.Name).IsRequired().HasMaxLength(100);
        modelBuilder.Entity<User>().Property(u => u.Email).IsRequired().HasMaxLength(200);

        modelBuilder.Entity<TaskItem>().HasKey(t => t.Id);
        modelBuilder.Entity<TaskItem>().Property(t => t.Title).IsRequired().HasMaxLength(200);
        modelBuilder.Entity<TaskItem>().Property(t => t.Description).HasMaxLength(1000);
    }
}

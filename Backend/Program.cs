using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Task_Tracker_Application.Application.Interfaces;
using Task_Tracker_Application.Domain.Entities;
using Task_Tracker_Application.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.SetIsOriginAllowed(origin =>
        {
            if (string.IsNullOrWhiteSpace(origin))
            {
                return false;
            }

            var uri = new Uri(origin);
            return uri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase)
                || uri.Host.Equals("127.0.0.1", StringComparison.OrdinalIgnoreCase);
        })
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=tasktracker.db";
builder.Services.AddDbContext<TaskTrackerDbContext>(options =>
    options.UseSqlite(connectionString));

builder.Services.AddScoped<IUserRepository, SqliteUserRepository>();
builder.Services.AddScoped<ITaskRepository, SqliteTaskRepository>();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Task Tracker Application v1");
    c.RoutePrefix = "swagger";
});

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<TaskTrackerDbContext>();
    db.Database.EnsureCreated();

    try
    {
        db.Database.ExecuteSqlRaw("ALTER TABLE \"Users\" ADD COLUMN \"PasswordHash\" TEXT NOT NULL DEFAULT ''");
    }
    catch (Exception ex) when (ex.Message.Contains("duplicate column name", StringComparison.OrdinalIgnoreCase))
    {
    }

    if (!db.Users.Any(u => u.Email == "admin@gmail.com"))
    {
        db.Users.Add(new User
        {
            Name = "admin",
            Email = "admin@gmail.com",
            PasswordHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes("Admin123!"))),
            Role = "admin",
            CreatedAt = DateTime.UtcNow
        });

        db.SaveChanges();
    }
}

app.Run();

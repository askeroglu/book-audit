using BookAudit.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BookAudit.Api.Data;

public class BookAuditDbContext : DbContext
{
    public BookAuditDbContext(DbContextOptions<BookAuditDbContext> options)
        : base(options) { }

    public DbSet<Book> Books => Set<Book>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Book>().HasData(
            new Book { Id = 1, Title = "The Pragmatic Programmer", Author = "Andrew Hunt", Description = "Classic software engineering book", CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Book { Id = 2, Title = "Clean Code", Author = "Robert C. Martin", Description = "A handbook of agile software craftsmanship", CreatedAt = new DateTime(2024, 2, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Book { Id = 3, Title = "Design Patterns", Author = "Erich Gamma", Description = "Elements of reusable object-oriented software", CreatedAt = new DateTime(2024, 3, 1, 0, 0, 0, DateTimeKind.Utc) }
        );
    }
}
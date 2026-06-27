using BookAudit.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BookAudit.Api.Data;

public class BookAuditDbContext : DbContext
{
    public BookAuditDbContext(DbContextOptions<BookAuditDbContext> options)
        : base(options) { }

    public DbSet<Book> Books => Set<Book>();
    public DbSet<Author> Authors => Set<Author>();
    public DbSet<BookAuthor> BookAuthors => Set<BookAuthor>();
    public DbSet<BookHistory> BookHistories => Set<BookHistory>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Book>(entity =>
        {
            entity.HasKey(b => b.Id);
            entity.Property(b => b.Title).HasMaxLength(200).IsRequired();
            entity.Property(b => b.Slug).HasMaxLength(250).IsRequired();
            entity.HasIndex(b => b.Slug).IsUnique();
            entity.Property(b => b.ShortDescription).HasMaxLength(1000);
            entity.Property(b => b.CreatedAt).IsRequired();
            entity.HasQueryFilter(b => !b.IsDeleted);
            entity.HasData(
                new Book { Id = 1, Title = "The Pragmatic Programmer", Slug = "the-pragmatic-programmer", ShortDescription = "Classic software engineering book", PublishDate = new DateOnly(1999, 10, 20), CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new Book { Id = 2, Title = "Clean Code", Slug = "clean-code", ShortDescription = "A handbook of agile software craftsmanship", PublishDate = new DateOnly(2008, 8, 1), CreatedAt = new DateTime(2024, 2, 1, 0, 0, 0, DateTimeKind.Utc) },
                new Book { Id = 3, Title = "Design Patterns", Slug = "design-patterns", ShortDescription = "Elements of reusable object-oriented software", PublishDate = new DateOnly(1994, 10, 21), CreatedAt = new DateTime(2024, 3, 1, 0, 0, 0, DateTimeKind.Utc) }
            );
        });

        modelBuilder.Entity<Author>(entity =>
        {
            entity.HasKey(a => a.Id);
            entity.Property(a => a.Name).HasMaxLength(200).IsRequired();
            entity.HasData(
                new Author { Id = 1, Name = "Andrew Hunt" },
                new Author { Id = 2, Name = "Robert C. Martin" },
                new Author { Id = 3, Name = "Erich Gamma" }
            );
        });

        modelBuilder.Entity<BookAuthor>(entity =>
        {
            entity.HasKey(ba => new { ba.BookId, ba.AuthorId });
            entity.HasOne(ba => ba.Book)
                .WithMany(b => b.BookAuthors)
                .HasForeignKey(ba => ba.BookId);
            entity.HasOne(ba => ba.Author)
                .WithMany(a => a.BookAuthors)
                .HasForeignKey(ba => ba.AuthorId);
            entity.HasQueryFilter(ba => !ba.Book.IsDeleted);
            entity.HasData(
                new BookAuthor { BookId = 1, AuthorId = 1 },
                new BookAuthor { BookId = 2, AuthorId = 2 },
                new BookAuthor { BookId = 3, AuthorId = 3 }
            );
        });

        modelBuilder.Entity<BookHistory>(entity =>
        {
            entity.HasKey(h => h.Id);
            entity.Property(h => h.Action).HasMaxLength(50).IsRequired();
            entity.Property(h => h.PropertyName).HasMaxLength(100).IsRequired();
            entity.Property(h => h.Description).HasMaxLength(1000).IsRequired();
            entity.HasOne(h => h.Book)
                .WithMany(b => b.History)
                .HasForeignKey(h => h.BookId)
                .IsRequired(false);
        });
    }
}
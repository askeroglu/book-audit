using BookAudit.Api.Data;
using BookAudit.Api.Dtos;
using BookAudit.Api.Helpers;
using BookAudit.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BookAudit.Api.Services;

public class BookService : IBookService
{
    private readonly BookAuditDbContext _context;

    public BookService(BookAuditDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<BookDto>> GetAllAsync()
    {
        return await _context.Books
            .AsNoTracking()
            .Select(b => MapToDto(b))
            .ToListAsync();
    }

    public async Task<BookDto?> GetByIdAsync(int id)
    {
        var book = await _context.Books.AsNoTracking().FirstOrDefaultAsync(b => b.Id == id);
        return book == null ? null : MapToDto(book);
    }

    public async Task<BookDto> CreateAsync(CreateBookRequest request)
    {
        var book = new Book
        {
            Title = request.Title,
            Author = request.Author,
            Description = request.Description,
            Slug = await GenerateUniqueSlug(request.Title)
        };
        _context.Books.Add(book);
        await _context.SaveChangesAsync();
        return MapToDto(book);
    }

    public async Task<BookDto?> UpdateAsync(int id, UpdateBookRequest request)
    {
        var book = await _context.Books.FindAsync(id);
        if (book == null) return null;

        book.Title = request.Title;
        book.Author = request.Author;
        book.Description = request.Description;
        book.Slug = await GenerateUniqueSlug(request.Title, book.Id);

        await _context.SaveChangesAsync();
        return MapToDto(book);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var book = await _context.Books.FindAsync(id);
        if (book == null) return false;

        book.IsDeleted = true;
        await _context.SaveChangesAsync();
        return true;
    }

    private async Task<string> GenerateUniqueSlug(string title, int? excludeId = null)
    {
        var baseSlug = SlugGenerator.Generate(title);
        var slug = baseSlug;
        var counter = 2;

        while (await _context.Books.AnyAsync(b => b.Slug == slug && b.Id != excludeId))
        {
            slug = $"{baseSlug}-{counter}";
            counter++;
        }

        return slug;
    }

    private static BookDto MapToDto(Book book) => new()
    {
        Id = book.Id,
        Title = book.Title,
        Author = book.Author,
        Description = book.Description,
        Slug = book.Slug,
        CreatedAt = book.CreatedAt
    };
}
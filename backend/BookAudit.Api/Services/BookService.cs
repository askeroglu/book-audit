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

    public async Task<PagedResult<BookDto>> GetAllAsync(BookListRequest request)
    {
        var query = _context.Books.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            query = query.Where(b => b.Title.Contains(request.SearchTerm) || b.Author.Contains(request.SearchTerm));
        }

        var totalCount = await query.CountAsync();

        var validColumns = new[] { "title", "author", "createdAt" };
        var sortColumn = validColumns.Contains(request.SortColumn?.ToLower()) ? request.SortColumn!.ToLower() : "createdAt";
        var sortDirection = request.SortDirection?.ToLower() == "desc" ? "desc" : "asc";

        query = sortColumn switch
        {
            "title" => sortDirection == "desc" ? query.OrderByDescending(b => b.Title) : query.OrderBy(b => b.Title),
            "author" => sortDirection == "desc" ? query.OrderByDescending(b => b.Author) : query.OrderBy(b => b.Author),
            _ => sortDirection == "desc" ? query.OrderByDescending(b => b.CreatedAt) : query.OrderBy(b => b.CreatedAt)
        };

        var items = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(b => MapToDto(b))
            .ToListAsync();

        return new PagedResult<BookDto>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };
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
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
            var term = request.SearchTerm.Trim().ToLower();
            query = query.Where(b => b.Title.ToLower().Contains(term) || b.Author.ToLower().Contains(term));
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

    public async Task<BookDto?> GetBySlugAsync(string slug)
    {
        var book = await _context.Books.AsNoTracking().FirstOrDefaultAsync(b => b.Slug == slug);
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

    public async Task<BookDto?> UpdateAsync(string slug, UpdateBookRequest request)
    {
        var book = await _context.Books.FirstOrDefaultAsync(b => b.Slug == slug);
        if (book == null) return null;

        book.Title = request.Title;
        book.Author = request.Author;
        book.Description = request.Description;
        book.Slug = await GenerateUniqueSlug(request.Title, book.Id);

        await _context.SaveChangesAsync();
        return MapToDto(book);
    }

    public async Task<bool> DeleteAsync(string slug)
    {
        var book = await _context.Books.FirstOrDefaultAsync(b => b.Slug == slug);
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

        while (await _context.Books.IgnoreQueryFilters().AnyAsync(b => b.Slug == slug && b.Id != excludeId))
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

    public async Task<PagedResult<BookHistoryDto>> GetBookHistoryAsync(string slug, HistoryQueryParameters query)
    {
        var book = await _context.Books.AsNoTracking().FirstOrDefaultAsync(b => b.Slug == slug);
        if (book is null) return new PagedResult<BookHistoryDto> { Items = [], TotalCount = 0, PageNumber = query.PageNumber, PageSize = query.PageSize };

        var q = _context.BookHistories
            .AsNoTracking()
            .Where(h => h.BookId == book.Id)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Action))
        {
            var pattern = $"%{query.Action.Trim()}%";
            q = q.Where(h => EF.Functions.Like(h.Action, pattern));
        }

        if (!string.IsNullOrWhiteSpace(query.PropertyName))
        {
            var pattern = $"%{query.PropertyName.Trim()}%";
            q = q.Where(h => EF.Functions.Like(h.PropertyName, pattern));
        }

        q = query.SortBy?.ToLowerInvariant() switch
        {
            "action" => query.SortDescending ? q.OrderByDescending(h => h.Action) : q.OrderBy(h => h.Action),
            "propertyname" or "property" => query.SortDescending ? q.OrderByDescending(h => h.PropertyName) : q.OrderBy(h => h.PropertyName),
            "changedat" or "changed-at" => query.SortDescending ? q.OrderByDescending(h => h.ChangedAt) : q.OrderBy(h => h.ChangedAt),
            _ => q.OrderByDescending(h => h.ChangedAt)
        };

        var total = await q.CountAsync();
        var page = Math.Max(query.PageNumber, 1);
        var pageSize = Math.Clamp(query.PageSize, 1, 100);

        var items = await q
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(h => new BookHistoryDto
            {
                Id = h.Id,
                BookId = h.BookId,
                ChangedAt = h.ChangedAt,
                Action = h.Action,
                PropertyName = h.PropertyName,
                OldValue = h.OldValue,
                NewValue = h.NewValue,
                Description = h.Description
            })
            .ToListAsync();

        return new PagedResult<BookHistoryDto>
        {
            Items = items,
            TotalCount = total,
            PageNumber = page,
            PageSize = pageSize
        };
    }
}
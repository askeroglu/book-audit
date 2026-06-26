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
        var query = _context.Books
            .AsNoTracking()
            .Include(b => b.BookAuthors)
            .ThenInclude(ba => ba.Author)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var search = request.SearchTerm.Trim();
            var pattern = $"%{search}%";
            query = query.Where(b =>
                EF.Functions.Like(b.Title, pattern) ||
                (b.ShortDescription != null && EF.Functions.Like(b.ShortDescription, pattern)) ||
                b.BookAuthors.Any(ba => EF.Functions.Like(ba.Author.Name, pattern)));
        }

        var totalCount = await query.CountAsync();

        var validColumns = new[] { "title", "authors", "publishDate", "createdAt" };
        var sortColumn = validColumns.Contains(request.SortColumn?.ToLower()) ? request.SortColumn!.ToLower() : "createdAt";
        var sortDirection = request.SortDirection?.ToLower() == "desc" ? "desc" : "asc";

        query = sortColumn switch
        {
            "title" => sortDirection == "desc" ? query.OrderByDescending(b => b.Title) : query.OrderBy(b => b.Title),
            "authors" => sortDirection == "desc"
                ? query.OrderByDescending(b => b.BookAuthors.Select(ba => ba.Author.Name).Min())
                : query.OrderBy(b => b.BookAuthors.Select(ba => ba.Author.Name).Min()),
            "publishdate" => sortDirection == "desc" ? query.OrderByDescending(b => b.PublishDate) : query.OrderBy(b => b.PublishDate),
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
        var book = await _context.Books
            .AsNoTracking()
            .Include(b => b.BookAuthors)
            .ThenInclude(ba => ba.Author)
            .FirstOrDefaultAsync(b => b.Slug == slug);
        return book == null ? null : MapToDto(book);
    }

    public async Task<BookDto> CreateAsync(CreateBookRequest request)
    {
        const int maxAttempts = 3;
        var title = request.Title.Trim();

        for (var attempt = 0; attempt < maxAttempts; attempt++)
        {
            try
            {
                var book = new Book
                {
                    Title = title,
                    Slug = await GenerateUniqueSlug(title),
                    ShortDescription = request.ShortDescription?.Trim(),
                    PublishDate = request.PublishDate
                };
                _context.Books.Add(book);
                await SyncAuthorsAsync(book, request.AuthorNames);
                await _context.SaveChangesAsync();
                return MapToDto(book);
            }
            catch (DbUpdateException ex) when (IsUniqueConstraintViolation(ex))
            {
                _context.ChangeTracker.Clear();
                if (attempt == maxAttempts - 1)
                    throw new InvalidOperationException("Could not generate a unique slug after multiple attempts.", ex);
            }
        }

        throw new InvalidOperationException("Could not generate a unique slug.");
    }

    public async Task<BookDto?> UpdateAsync(string slug, UpdateBookRequest request)
    {
        const int maxAttempts = 3;
        var title = request.Title.Trim();

        for (var attempt = 0; attempt < maxAttempts; attempt++)
        {
            try
            {
                var book = await _context.Books
                    .Include(b => b.BookAuthors)
                    .ThenInclude(ba => ba.Author)
                    .FirstOrDefaultAsync(b => b.Slug == slug);
                if (book == null) return null;

                book.Title = title;
                book.Slug = await GenerateUniqueSlug(title, book.Id);
                book.ShortDescription = request.ShortDescription?.Trim();
                book.PublishDate = request.PublishDate;

                await SyncAuthorsAsync(book, request.AuthorNames);

                await _context.SaveChangesAsync();
                return MapToDto(book);
            }
            catch (DbUpdateException ex) when (IsUniqueConstraintViolation(ex))
            {
                _context.ChangeTracker.Clear();
                if (attempt == maxAttempts - 1)
                    throw new InvalidOperationException("Could not generate a unique slug after multiple attempts.", ex);
            }
        }

        throw new InvalidOperationException("Could not update book.");
    }

    public async Task<bool> DeleteAsync(string slug)
    {
        var book = await _context.Books.FirstOrDefaultAsync(b => b.Slug == slug);
        if (book == null) return false;

        book.IsDeleted = true;
        await _context.SaveChangesAsync();
        return true;
    }

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
            "propertyname" => query.SortDescending ? q.OrderByDescending(h => h.PropertyName) : q.OrderBy(h => h.PropertyName),
            "changedat" => query.SortDescending ? q.OrderByDescending(h => h.ChangedAt) : q.OrderBy(h => h.ChangedAt),
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

    private async Task SyncAuthorsAsync(Book book, List<string> authorNames)
    {
        var normalizedNames = authorNames
            .Select(n => n.Trim())
            .Where(n => !string.IsNullOrWhiteSpace(n))
            .Distinct()
            .ToList();

        var existingAuthors = await _context.Authors
            .Where(a => normalizedNames.Contains(a.Name))
            .ToListAsync();

        var currentNames = book.BookAuthors
            .Select(ba => ba.Author.Name)
            .ToList();

        var namesToAdd = normalizedNames.Except(currentNames).ToList();
        var namesToRemove = currentNames.Except(normalizedNames).ToList();

        foreach (var name in namesToRemove)
        {
            var bookAuthor = book.BookAuthors.First(ba => ba.Author.Name == name);
            book.BookAuthors.Remove(bookAuthor);
        }

        foreach (var name in namesToAdd)
        {
            var author = existingAuthors.FirstOrDefault(a => a.Name == name);
            if (author is null)
            {
                author = new Author { Name = name };
                _context.Authors.Add(author);
            }
            book.BookAuthors.Add(new BookAuthor { Author = author });
        }
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

    private static bool IsUniqueConstraintViolation(DbUpdateException ex)
    {
        var message = ex.InnerException?.Message ?? ex.Message;
        return message.Contains("UNIQUE constraint failed", StringComparison.OrdinalIgnoreCase);
    }

    private static BookDto MapToDto(Book book) => new()
    {
        Id = book.Id,
        Title = book.Title,
        Slug = book.Slug,
        ShortDescription = book.ShortDescription,
        PublishDate = book.PublishDate,
        CreatedAt = book.CreatedAt,
        Authors = book.BookAuthors
            .Select(ba => ba.Author.Name)
            .OrderBy(n => n)
            .ToList()
    };
}
using BookAudit.Api.Dtos;

namespace BookAudit.Api.Services;

public interface IBookService
{
    Task<PagedResult<BookDto>> GetAllAsync(BookListRequest request);
    Task<BookDto?> GetBySlugAsync(string slug);
    Task<BookDto> CreateAsync(CreateBookRequest request);
    Task<BookDto?> UpdateAsync(string slug, UpdateBookRequest request);
    Task<bool> DeleteAsync(string slug);
    Task<PagedResult<BookHistoryDto>> GetBookHistoryAsync(string slug, HistoryQueryParameters query);
}
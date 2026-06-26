using BookAudit.Api.Dtos;

namespace BookAudit.Api.Services;

public interface IBookService
{
    Task<IEnumerable<BookDto>> GetAllAsync();
    Task<BookDto?> GetByIdAsync(int id);
    Task<BookDto> CreateAsync(CreateBookRequest request);
    Task<BookDto?> UpdateAsync(int id, UpdateBookRequest request);
    Task<bool> DeleteAsync(int id);
}
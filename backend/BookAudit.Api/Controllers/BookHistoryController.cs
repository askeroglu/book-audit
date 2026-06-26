using BookAudit.Api.Data;
using BookAudit.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BookAudit.Api.Controllers;

[ApiController]
[Route("api/books/{bookId}/[controller]")]
public class BookHistoryController : ControllerBase
{
    private readonly BookAuditDbContext _context;

    public BookHistoryController(BookAuditDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BookHistory>>> GetHistory(int bookId)
    {
        var history = await _context.BookHistories
            .Where(h => h.BookId == bookId)
            .OrderByDescending(h => h.Timestamp)
            .ToListAsync();

        return Ok(history);
    }
}
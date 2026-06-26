using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BookAudit.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Books",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Title = table.Column<string>(type: "TEXT", nullable: false),
                    Author = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Books", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Books",
                columns: new[] { "Id", "Author", "CreatedAt", "Description", "Title" },
                values: new object[,]
                {
                    { 1, "Andrew Hunt", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Classic software engineering book", "The Pragmatic Programmer" },
                    { 2, "Robert C. Martin", new DateTime(2024, 2, 1, 0, 0, 0, 0, DateTimeKind.Utc), "A handbook of agile software craftsmanship", "Clean Code" },
                    { 3, "Erich Gamma", new DateTime(2024, 3, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Elements of reusable object-oriented software", "Design Patterns" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Books");
        }
    }
}

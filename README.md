# Court Data Fetcher & Mini-Dashboard

A web application that fetches and displays case information from Indian courts, specifically targeting the Delhi High Court. Built with Next.js, TypeScript, and SQLite.

## 🏛️ Court Target

**Delhi High Court** (https://delhihighcourt.nic.in/)

This application targets the Delhi High Court's case status system. The choice was made due to:
- Standardized case numbering system
- Consistent web interface
- Reliable uptime
- Comprehensive case information available

## ✨ Features

- **Case Search**: Search by Case Type, Case Number, and Filing Year
- **Data Display**: View parties, filing dates, hearing dates, and case status
- **Order/Judgment Access**: View and download PDF documents
- **Query History**: Track all searches with success/failure status
- **Error Handling**: User-friendly messages for invalid cases or site downtime
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/yourusername/court-data-fetcher.git
   cd court-data-fetcher
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Initialize the database**
   \`\`\`bash
   npm run db:init
   \`\`\`

4. **Install Playwright browsers** (for web scraping)
   \`\`\`bash
   npx playwright install chromium
   \`\`\`

5. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

6. **Open your browser**
   Navigate to \`http://localhost:3000\`

## 🔧 Environment Variables

Create a \`.env.local\` file in the root directory:

\`\`\`env
# Database
DATABASE_URL=./court_data.db

# Optional: CAPTCHA solving service API key
CAPTCHA_API_KEY=your_captcha_service_key

# Optional: Proxy settings for scraping
PROXY_URL=http://your-proxy-server:port
\`\`\`

## 🕷️ CAPTCHA Strategy

The application handles CAPTCHAs through multiple strategies:

### Current Implementation (Mock Mode)
- **Mock Data**: For demonstration, the app returns simulated case data
- **Error Simulation**: Test error handling with specific case numbers (9999, 0000)

### Production Strategies (Commented in Code)

1. **OCR-based Solving**
   - Use libraries like Tesseract.js for simple text CAPTCHAs
   - Implement image preprocessing for better accuracy

2. **Third-party CAPTCHA Services**
   - Integration with services like 2captcha or Anti-Captcha
   - Automatic solving with API calls

3. **Manual Input Field**
   - Display CAPTCHA image to user
   - Allow manual entry before form submission

4. **API Discovery**
   - Look for undocumented API endpoints
   - Monitor network traffic for direct data access

## 📊 Database Schema

### Queries Table
- \`id\`: Primary key
- \`case_type\`: Type of case (Civil Appeal, Writ Petition, etc.)
- \`case_number\`: Case number
- \`filing_year\`: Year of filing
- \`timestamp\`: When the query was made
- \`success\`: Whether the query was successful
- \`raw_response\`: Raw response data or error message

### Cases Table (Optional Caching)
- \`id\`: Composite key (case_type-case_number-filing_year)
- Case details for caching successful queries

## 🐳 Docker Deployment

### Build and Run

\`\`\`bash
# Build the Docker image
docker build -t court-data-fetcher .

# Run the container
docker run -p 3000:3000 -v $(pwd)/data:/app/data court-data-fetcher
\`\`\`

### Docker Compose

\`\`\`yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
    environment:
      - NODE_ENV=production
\`\`\`

## 🧪 Testing

### Test Cases

1. **Valid Case**: Enter any case number except 9999 or 0000
2. **Invalid Case**: Enter case number 9999 to test "Case not found" error
3. **Site Downtime**: Enter case number 0000 to test "Site unavailable" error

### Sample Test Data

- **Case Type**: Civil Appeal
- **Case Number**: 1234
- **Filing Year**: 2024

## 🔒 Security Considerations

- No hardcoded secrets in the codebase
- Environment variables for sensitive configuration
- Rate limiting on API endpoints (recommended for production)
- Input validation and sanitization
- Secure PDF download handling

## 📁 Project Structure

\`\`\`
court-data-fetcher/
├── app/
│   ├── api/
│   │   ├── fetch-case/route.ts
│   │   ├── query-history/route.ts
│   │   └── download-pdf/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── case-results.tsx
│   └── query-history.tsx
├── lib/
│   ├── database.ts
│   └── scraper.ts
├── scripts/
│   └── init-database.sql
├── Dockerfile
├── package.json
└── README.md
\`\`\`

## 🚧 Known Limitations

1. **Mock Implementation**: Current scraper returns mock data
2. **CAPTCHA Handling**: Requires implementation for production use
3. **Rate Limiting**: No built-in rate limiting (add for production)
4. **Error Recovery**: Basic error handling (can be enhanced)

## 🔮 Future Enhancements

- [ ] Real web scraping implementation with Playwright
- [ ] CAPTCHA solving integration
- [ ] Multiple court support
- [ ] Advanced search filters
- [ ] Case status notifications
- [ ] Export functionality (CSV, PDF reports)
- [ ] User authentication and saved searches
- [ ] API rate limiting and caching
- [ ] Comprehensive test suite
- [ ] CI/CD pipeline

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.



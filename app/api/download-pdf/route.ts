import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { pdfUrl, title } = await request.json()

    if (!pdfUrl) {
      return NextResponse.json({ error: "PDF URL is required" }, { status: 400 })
    }

    // Fetch the PDF from the court website
    const response = await fetch(pdfUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch PDF")
    }

    const pdfBuffer = await response.arrayBuffer()

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error downloading PDF:", error)
    return NextResponse.json({ error: "Failed to download PDF" }, { status: 500 })
  }
}

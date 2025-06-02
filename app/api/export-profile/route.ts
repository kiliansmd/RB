import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

export async function POST(request: NextRequest) {
  try {
    const { url, width = 1200, format = 'pdf', quality = 100 } = await request.json()
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Launch Puppeteer with optimized settings
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080',
      ],
    })

    const page = await browser.newPage()

    // Set viewport for consistent rendering
    await page.setViewport({
      width: width,
      height: 1080,
      deviceScaleFactor: 2, // For high-DPI rendering
    })

    // Navigate to the page
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    })

    // Wait for fonts to load
    await page.evaluateHandle('document.fonts.ready')

    // Hide print-only elements and show no-print elements for web view
    await page.addStyleTag({
      content: `
        .no-print-element { display: none !important; }
        .print-only { display: block !important; }
        
        /* Optimize for print */
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        body {
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
        }
        
        /* Ensure shadows and gradients are preserved */
        .shadow-lg, .shadow-xl, .shadow-2xl {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
        }
        
        /* Preserve gradients */
        [style*="background"] {
          background-image: inherit !important;
        }
      `
    })

    let result: Uint8Array

    if (format === 'pdf') {
      // Generate high-quality PDF
      result = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: {
          top: '0.5in',
          right: '0.5in',
          bottom: '0.5in',
          left: '0.5in',
        },
        displayHeaderFooter: false,
      })
    } else {
      // Generate high-quality screenshot
      result = await page.screenshot({
        type: format === 'png' ? 'png' : 'jpeg',
        quality: format === 'jpeg' ? quality : undefined,
        fullPage: true,
        optimizeForSpeed: false,
      })
    }

    await browser.close()

    // Convert to Buffer for proper handling
    const buffer = Buffer.from(result)

    // Set appropriate headers
    const contentType = format === 'pdf' 
      ? 'application/pdf' 
      : format === 'png' 
        ? 'image/png' 
        : 'image/jpeg'

    const fileName = `kandidat-profil-${Date.now()}.${format}`

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': buffer.length.toString(),
      },
    })

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to generate export' },
      { status: 500 }
    )
  }
} 
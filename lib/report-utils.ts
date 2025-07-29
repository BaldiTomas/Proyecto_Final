import jsPDF from "jspdf"
import "jspdf-autotable"

export interface ReportOptions {
  includeTransactions: boolean
  includeOwnershipHistory: boolean
  includeProductDetails: boolean
  includeQRCode: boolean
}

export interface ReportData {
  product: any
  transactions: any[]
  ownershipHistory?: any[]
  reportGeneratedBy: string
  reportGeneratedAt: number
}

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

export function generateProductReport(data: ReportData, options: ReportOptions): Blob {
  const doc = new jsPDF()
  let yPosition = 20

  doc.setFontSize(20)
  doc.setTextColor(40, 40, 40)
  doc.text("TrackChain - Reporte de Trazabilidad", 20, yPosition)
  yPosition += 10

  doc.setFontSize(12)
  doc.setTextColor(100, 100, 100)
  doc.text(
    `Generado el: ${new Date().toLocaleDateString("es-ES")}`,
    20,
    (yPosition += 10)
  )
  yPosition += 10

  if (options.includeProductDetails && data.product) {
    doc.setFontSize(16)
    doc.setTextColor(40, 40, 40)
    doc.text("Información del Producto", 20, yPosition)
    yPosition += 10

    const productData = [
      ["ID", `#${data.product.id}`],
      ["Nombre", data.product.name],
      ["Descripción", data.product.description || "N/A"],
      ["Categoría", data.product.category || "N/A"],
      ["Productor", data.product.producer_name || "N/A"],
      ["Origen", data.product.origin || "N/A"],
      [
        "Fecha de Creación",
        data.product.created_at
          ? new Date(data.product.created_at).toLocaleDateString("es-ES")
          : "N/A",
      ],
    ]

    doc.autoTable({
      startY: yPosition,
      head: [["Campo", "Valor"]],
      body: productData,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 20, right: 20 },
    })

    yPosition = (doc as any).lastAutoTable.finalY + 10
  }

  if (options.includeOwnershipHistory && data.ownershipHistory && data.ownershipHistory.length) {
    doc.setFontSize(16)
    doc.setTextColor(40, 40, 40)
    doc.text("Historial de Trazabilidad", 20, yPosition)
    yPosition += 10

    const historyData = data.ownershipHistory.map((entry: any) => [
      new Date(entry.timestamp).toLocaleDateString("es-ES"),
      entry.action || "N/A",
      entry.blockchain_hash || entry.blockchainHash || "N/A",
    ])

    doc.autoTable({
      startY: yPosition,
      head: [["Fecha", "Acción", "Blockchain Hash"]],
      body: historyData,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 20, right: 20 },
      columnStyles: {
        2: { cellWidth: 100 },
      },
    })

    yPosition = (doc as any).lastAutoTable.finalY + 10
  }

  if (options.includeTransactions && data.transactions && data.transactions.length) {
    doc.setFontSize(16)
    doc.setTextColor(40, 40, 40)
    doc.text("Historial de Transacciones", 20, yPosition)
    yPosition += 10

    const transactionData = data.transactions.map((tx: any) => [
      `#${tx.id}`,
      new Date(tx.created_at).toLocaleDateString("es-ES"),
      tx.seller_name || "N/A",
      tx.buyer_name || "N/A",
      tx.quantity?.toString() || "N/A",
      tx.status || "N/A",
    ])

    doc.autoTable({
      startY: yPosition,
      head: [["ID", "Fecha", "Vendedor", "Comprador", "Cantidad", "Estado"]],
      body: transactionData,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 20, right: 20 },
    })

    yPosition = (doc as any).lastAutoTable.finalY + 10
  }

  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(10)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `Página ${i} de ${pageCount} - Generado por ${data.reportGeneratedBy}`,
      20,
      doc.internal.pageSize.height - 10
    )
  }

  return doc.output("blob")
}

export function downloadReport(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function getReportFilename(product: any): string {
  const date = new Date().toISOString().split("T")[0]
  const productName = product.name.replace(/[^a-zA-Z0-9]/g, "_")
  return `TrackChain_Reporte_${productName}_${date}.pdf`
}
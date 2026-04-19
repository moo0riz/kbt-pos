# POS MVP (Pencatatan Barang + HPP)

Aplikasi web POS sederhana untuk mencatat barang yang ingin dijual, menghitung:
- **HPP per item** = `rawCost` (biaya bahan baku)
- **Margin** = `sellPrice - rawCost`

Data disimpan otomatis di **localStorage** (tanpa backend).

## Menjalankan

- Dev server: `npm run dev`
- Build: `npm run build`
- Preview hasil build: `npm run preview`

## Fitur MVP

- Tambah barang: nama, harga jual, biaya bahan baku
- Lihat daftar barang + pencarian
- Edit / hapus barang
- Ringkasan total (harga jual, total HPP, total margin)

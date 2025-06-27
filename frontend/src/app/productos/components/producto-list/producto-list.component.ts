import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../services/producto.service';
import { Producto } from '../../models/producto.interface';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CategoriaService } from '../../../categorias/services/categoria.service';
import { ProveedorService } from '../../../proveedores/services/proveedor.service';
import { Categoria } from '../../../categorias/models/categoria.interface';
import { Proveedor } from '../../../proveedores/models/proveedor.interface';

@Component({
  selector: 'app-producto-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './producto-list.component.html',
  styleUrls: ['./producto-list.component.scss']
})
export class ProductoListComponent implements OnInit {
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  filtro: string = '';
  loading = true;
  eliminandoId: number | null = null;
  paginaActual: number = 1;
  productosPorPagina: number = 15;
  categorias: Categoria[] = [];
  proveedores: Proveedor[] = [];
  categoriaSeleccionada: string = '';
  proveedorSeleccionado: string = '';
  stockBajo: boolean = false;
  estadoSeleccionado: string = '';
  totalPaginas: number = 1;
  totalProductos: number = 0;
  primerItem: number = 0;
  ultimoItem: number = 0;

  constructor(
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private proveedorService: ProveedorService,
    private router: Router
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      if (event.urlAfterRedirects === '/productos' || event.url === '/productos') {
        this.aplicarFiltros();
      }
    });
  }

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarProveedores();
    this.aplicarFiltros();
  }

  cargarCategorias(): void {
    this.categoriaService.getCategorias().subscribe({
      next: (categorias) => this.categorias = categorias,
      error: () => this.categorias = []
    });
  }

  cargarProveedores(): void {
    this.proveedorService.getProveedores().subscribe({
      next: (proveedores) => this.proveedores = proveedores,
      error: () => this.proveedores = []
    });
  }

  aplicarFiltros(pagina: number = 1): void {
    const filtros: any = { page: pagina, per_page: this.productosPorPagina };
    if (this.filtro) filtros.search = this.filtro;
    if (this.categoriaSeleccionada) filtros.categoria_id = this.categoriaSeleccionada;
    if (this.proveedorSeleccionado) filtros.proveedor_id = this.proveedorSeleccionado;
    if (this.stockBajo) filtros.stock_bajo = 1;
    if (this.estadoSeleccionado) filtros.estado = this.estadoSeleccionado;

    this.loading = true;
    this.productoService.getProductosConFiltros(filtros).subscribe({
      next: (res) => {
        this.productos = Array.isArray(res.data?.data) ? res.data.data : [];
        this.paginaActual = res.current_page;
        this.totalPaginas = res.last_page;
        this.totalProductos = res.total;
        this.primerItem = res.from ?? 0;
        this.ultimoItem = res.to ?? 0;
        if (res.per_page) {
          this.productosPorPagina = res.per_page;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  limpiarFiltros(): void {
    this.filtro = '';
    this.categoriaSeleccionada = '';
    this.proveedorSeleccionado = '';
    this.stockBajo = false;
    this.estadoSeleccionado = '';
    this.aplicarFiltros();
  }

  filtrarProductos(): void {
    const filtro = this.filtro.toLowerCase();
    this.productosFiltrados = this.productos.filter(producto =>
      producto.nombre.toLowerCase().includes(filtro) ||
      producto.codigo.toLowerCase().includes(filtro) ||
      producto.descripcion.toLowerCase().includes(filtro)
    );
    this.paginaActual = 1;
  }

  nuevoProducto(): void {
    this.router.navigate(['/productos/nuevo']);
  }

  editarProducto(id: number): void {
    this.router.navigate(['/productos/editar', id]);
  }

  eliminarProducto(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      this.eliminandoId = id;
      this.productoService.deleteProducto(id).subscribe({
        next: () => {
          this.aplicarFiltros(this.paginaActual);
          this.eliminandoId = null;
        },
        error: (error) => {
          if (error.status === 404) {
            this.aplicarFiltros(this.paginaActual);
          } else {
            alert('Error al eliminar el producto.');
          }
          this.eliminandoId = null;
        }
      });
    }
  }

  verProducto(id: number): void {
    this.router.navigate(['/productos/ver', id]);
  }

  getCategoriaNombre(categoriaId: number): string {
    const categoria = this.categorias.find(cat => cat.id === categoriaId);
    return categoria ? categoria.nombre : '-';
  }

  getProveedorNombre(proveedorId: number): string {
    const proveedor = this.proveedores.find(prov => prov.id === proveedorId);
    return proveedor ? proveedor.nombre : '-';
  }

}
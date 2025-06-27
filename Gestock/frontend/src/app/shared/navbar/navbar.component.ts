import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { ProductoService } from '../../productos/services/producto.service';
import { ProveedorService } from '../../proveedores/services/proveedor.service';
import { CategoriaService } from '../../categorias/services/categoria.service';
import { Producto } from '../../productos/models/producto.interface';
import { Proveedor } from '../../proveedores/models/proveedor.interface';
import { Categoria } from '../../categorias/models/categoria.interface';
import { filter } from 'rxjs/operators';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent implements OnInit {
  isAdmin = false;
  busqueda: string = '';
  filtroProveedor: string = '';
  filtroCategoria: string = '';
  proveedores: Proveedor[] = [];
  categorias: Categoria[] = [];
  productos: Producto[] = [];

  constructor(
    private router: Router,
    private productoService: ProductoService,
    private proveedorService: ProveedorService,
    private categoriaService: CategoriaService
  ) {}

  ngOnInit() {
    this.cargarUsuarioYListas();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.cargarUsuarioYListas();
    });
  }

  private cargarUsuarioYListas() {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userObj = JSON.parse(user);
        this.isAdmin = userObj.id === 1;
      } catch {
        this.isAdmin = false;
      }
    }
    this.proveedorService.getProveedores().subscribe({
      next: (provs) => this.proveedores = provs,
      error: () => this.proveedores = []
    });
    this.categoriaService.getCategorias().subscribe({
      next: (cats) => this.categorias = cats,
      error: () => this.categorias = []
    });
  }

  buscarProducto() {
    const queryParams: any = {};
    if (this.busqueda && this.busqueda.trim() !== '') {
      queryParams.busqueda = this.busqueda.trim();
    }
    this.router.navigate(['/productos/listar'], { queryParams });
  }

  filtrarPorProveedor() {
    // Implementa la lógica de filtrado por proveedor aquí
  }

  filtrarPorCategoria() {
    // Implementa la lógica de filtrado por categoría aquí
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}

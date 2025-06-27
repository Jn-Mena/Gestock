import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ProductoService } from '../services/producto.service';

@Component({
  selector: 'app-listar',
  templateUrl: './listar.component.html',
  styleUrls: ['./listar.component.scss']
})
export class ListarComponent implements OnInit {
  productos: any[] = [];
  busqueda: string = '';

  constructor(
    private productoService: ProductoService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.cargarProductos();
    });
  }

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.route.queryParams.subscribe(params => {
      this.busqueda = params['busqueda'] || '';
      const filtros: any = {};
      if (this.busqueda && this.busqueda.trim() !== '') {
        filtros.busqueda = this.busqueda.trim();
      }
      this.productoService.getProductosConFiltros(filtros).subscribe(
        (data) => {
          // Si la API responde con .data, usa data.data; si no, usa data
          this.productos = data.data ? data.data : data;
        },
        (error) => {
          console.error('Error fetching products:', error);
        }
      );
    });
  }
}

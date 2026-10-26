import { Injectable, computed, signal } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs';

import { GuideStep, GuideTour } from '../interfaces/guide.interface';

@Injectable({ providedIn: 'root' })
export class ModuleGuideService {
  private readonly _guides = new Map<string, () => GuideTour>();
  private readonly _tour = signal<GuideTour | null>(null);
  private readonly _index = signal(0);

  readonly tour = this._tour.asReadonly();
  readonly index = this._index.asReadonly();
  readonly active = computed(() => this._tour() !== null);
  readonly step = computed<GuideStep | null>(() => this._tour()?.steps[this._index()] ?? null);
  readonly total = computed(() => this._tour()?.steps.length ?? 0);
  readonly isFirst = computed(() => this._index() === 0);
  readonly isLast = computed(() => this._index() === this.total() - 1);

  constructor(private _router: Router) {
    this.registerGuides();
    this._router.events.pipe(filter(event => event instanceof NavigationStart)).subscribe(() => this.close());
  }

  start(): void {
    const tour = this.guideFor(this._router.url);
    const steps = tour.steps.filter(step => !step.selector || this.isVisible(step.selector));
    if (!steps.length) return;
    this._index.set(0);
    this._tour.set({ ...tour, steps });
  }

  next(): void {
    if (this.isLast()) {
      this.close();
      return;
    }
    this._index.update(value => value + 1);
  }

  previous(): void {
    if (this.isFirst()) return;
    this._index.update(value => value - 1);
  }

  close(): void {
    this._tour.set(null);
    this._index.set(0);
  }

  private registerGuides(): void {
    this._guides.set('/dashboard', () => this.buildDashboardGuide());
    this._guides.set('/users', () => this.buildFleetGuide());
    this._guides.set('/alerts', () => this.buildAlertsGuide());
    this._guides.set('/devices', () => this.buildDevicesGuide());
    this._guides.set('/settings', () => this.buildSettingsGuide());
    this._guides.set('/onboarding', () => this.buildOnboardingGuide());
    this._guides.set('/companies', () => this.buildCompaniesGuide());
  }

  private guideFor(url: string): GuideTour {
    const path = url.split(/[?#]/)[0];
    const build = this._guides.get(path);
    return build ? build() : this.buildDefaultGuide();
  }

  private isVisible(selector: string): boolean {
    const element = document.querySelector<HTMLElement>(selector);
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  private buildDashboardGuide(): GuideTour {
    return {
      title: 'Dashboard',
      steps: [
        {
          selector: '.page-header',
          title: 'Dashboard',
          description: 'Resumen de la operación de tu empresa en tiempo real.',
        },
        {
          selector: '.dashboard__range',
          title: 'Rango de fechas',
          description: 'Elige el periodo que quieres analizar. Los indicadores y gráficas se actualizan según este rango.',
        },
        {
          selector: '.dashboard__refresh',
          title: 'Actualizar',
          description: 'Vuelve a cargar la información del dashboard.',
        },
        {
          selector: '.dashboard__stats',
          title: 'Indicadores',
          description: 'Vehículos registrados, usuarios activos, dispositivos y alertas del día de un vistazo.',
        },
        {
          selector: '.wrapper-section > app-table',
          title: 'Estado de dispositivos',
          description: 'Últimos dispositivos con su estado de conexión. Usa "Ver todos" para ir al listado completo.',
        },
        {
          selector: '.wrapper-section > app-table ~ app-table',
          title: 'Últimas alertas',
          description: 'Las alertas más recientes con su tipo, duración y nivel. Usa "Ver todas" para ir al historial.',
        },
        {
          selector: '.dashboard__charts',
          title: 'Gráficas',
          description: 'Alertas por día y los usuarios con más alertas en el periodo seleccionado.',
        },
        ...this.navigationSteps(),
      ],
    };
  }

  private buildFleetGuide(): GuideTour {
    return {
      title: 'Gestión de flota',
      steps: [
        {
          selector: '.page-header',
          title: 'Gestión de flota',
          description: 'Administra conductores, vehículos, dispositivos y las vinculaciones entre ellos.',
        },
        {
          selector: '.tabs',
          title: 'Pestañas',
          description: 'Cambia entre conductores, vehículos, dispositivos y vinculaciones.',
        },
        {
          selector: '.toolbar .search',
          title: 'Buscar',
          description: 'Filtra el listado escribiendo lo que buscas.',
        },
        {
          selector: '.toolbar .btn--primary',
          title: 'Crear',
          description: 'Agrega un nuevo registro en la pestaña actual.',
        },
        {
          selector: '.toolbar .ng-select--filter',
          title: 'Filtrar por estado',
          description: 'Muestra solo los registros activos o inactivos.',
        },
        ...this.tableSteps(),
        {
          selector: '.row-actions',
          title: 'Acciones',
          description: 'Edita, consulta o cambia el estado de cada registro desde estos botones.',
        },
        ...this.navigationSteps(),
      ],
    };
  }

  private buildAlertsGuide(): GuideTour {
    return {
      title: 'Alertas',
      steps: [
        {
          selector: '.page-header',
          title: 'Alertas',
          description: 'Historial completo de alertas generadas por los dispositivos.',
        },
        {
          selector: '.filters',
          title: 'Filtros',
          description: 'Filtra por rango de fechas, usuario, vehículo, tipo de alerta y nivel.',
        },
        {
          selector: '.filters__field--wide',
          title: 'Buscar por ubicación',
          description: 'Escribe una ubicación para encontrar las alertas generadas allí. Con el botón de la derecha actualizas el listado.',
        },
        ...this.tableSteps(),
        {
          selector: '.row-actions',
          title: 'Ver detalle',
          description: 'Abre el detalle completo de una alerta.',
        },
        ...this.navigationSteps(),
      ],
    };
  }

  private buildDevicesGuide(): GuideTour {
    return {
      title: 'Dispositivos',
      steps: [
        {
          selector: '.page-header',
          title: 'Dispositivos',
          description: 'Estado y última conexión de los dispositivos de tu empresa.',
        },
        {
          selector: '.toolbar .search',
          title: 'Buscar',
          description: 'Encuentra un dispositivo por serial, placa o usuario.',
        },
        {
          selector: '.toolbar .ng-select--filter',
          title: 'Filtrar por estado',
          description: 'Muestra solo los dispositivos activos o sin conexión.',
        },
        ...this.tableSteps(),
        ...this.navigationSteps(),
      ],
    };
  }

  private buildSettingsGuide(): GuideTour {
    return {
      title: 'Configuración',
      steps: [
        {
          selector: '.page-header',
          title: 'Configuración',
          description: 'Define el comportamiento del sistema de detección de somnolencia para toda la empresa.',
        },
        {
          selector: '.settings-card',
          title: 'Detección de somnolencia',
          description: 'Activa o desactiva el reconocimiento de rostro, las notificaciones y ajusta la duración de la alarma.',
        },
        {
          selector: '.settings-card ~ .settings-card',
          title: 'Información de la empresa',
          description: 'Datos generales y logo de la empresa que se muestran en la plataforma.',
        },
        {
          selector: '.settings__footer',
          title: 'Guardar',
          description: 'Recuerda guardar para aplicar los cambios.',
        },
        ...this.navigationSteps(),
      ],
    };
  }

  private buildOnboardingGuide(): GuideTour {
    return {
      title: 'Onboarding',
      steps: [
        {
          selector: '.page-header',
          title: 'Onboarding',
          description: 'Solicitudes de registro recibidas desde el sitio.',
        },
        {
          selector: '.status-tabs',
          title: 'Estados',
          description: 'Filtra las solicitudes por estado. El número indica cuántas hay en cada uno.',
        },
        ...this.tableSteps(),
        {
          selector: '.row-actions',
          title: 'Revisar solicitud',
          description: 'Abre la solicitud para aprobarla o rechazarla.',
        },
        ...this.navigationSteps(),
      ],
    };
  }

  private buildCompaniesGuide(): GuideTour {
    return {
      title: 'Empresas',
      steps: [
        {
          selector: '.page-header',
          title: 'Empresas',
          description: 'Empresas registradas en la plataforma.',
        },
        {
          selector: '.page-header .search',
          title: 'Buscar',
          description: 'Encuentra una empresa por su nombre.',
        },
        ...this.tableSteps(),
        {
          selector: '.row-actions',
          title: 'Acciones',
          description: 'Consulta los dispositivos de la empresa o edita su información.',
        },
        ...this.navigationSteps(),
      ],
    };
  }

  private buildDefaultGuide(): GuideTour {
    return {
      title: 'Asistente',
      steps: [
        {
          title: 'Asistente',
          description: 'Todavía no hay un recorrido para esta pantalla. Te mostramos lo básico de la plataforma.',
        },
        ...this.navigationSteps(),
      ],
    };
  }

  private tableSteps(): GuideStep[] {
    return [
      {
        selector: '.table-wrapper',
        title: 'Listado',
        description: 'Aquí se muestran los registros que coinciden con la búsqueda y los filtros aplicados.',
      },
    ];
  }

  private navigationSteps(): GuideStep[] {
    return [
      {
        selector: '.topbar__bell',
        title: 'Notificaciones',
        description: 'Consulta las notificaciones recientes. El número indica cuántas tienes sin leer.',
      },
    ];
  }
}

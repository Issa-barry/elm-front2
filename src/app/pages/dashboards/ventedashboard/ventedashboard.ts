import { Component, OnInit, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductService } from '@/app/pages//service/product.service';
import { SelectModule } from 'primeng/select';
import { HeaderWidget } from '../banking/headerwidget';
import { RecentTransactionsWidget } from '../banking/recenttransactionswidget';
import { OverviewWidget } from '../banking/overviewwidget';
import { RecentTransactionsTwoWidget } from '../banking/recenttransactionstwowidget';
import { MonthlyPaymentsWidget } from '../banking/monthlypaymentswidget';
import { SoldeCardWidget } from '../widgets/solde-card-widget/solde-card-widget';
import {
  DashboardService,
  EncaissementStat,
  VentesEncaissementsPeriod,
} from '@/services/dashboard/dashboard.service';
import { UsineContextService } from '@/services/usine/usine-context.service';
 import { caParStatutWidget } from '../widgets/caparstatutwidget';
import { DonughtWiget } from '../widgets/donught-wiget/donught-wiget';
import { BarWiget } from '../widgets/bar-wiget/bar-wiget';
 
@Component({
  selector: 'app-ventedashboard',
  standalone: true,
  imports: [
    FormsModule,
    SelectModule,
    HeaderWidget,
    RecentTransactionsWidget,
    OverviewWidget,
    RecentTransactionsTwoWidget,
    MonthlyPaymentsWidget,
    SoldeCardWidget,
     caParStatutWidget,
    DonughtWiget, 
    BarWiget
  ],
  providers: [ProductService],
  templateUrl: './ventedashboard.html',
  styleUrl: './ventedashboard.scss',
  host: {
    '[style.display]': '"contents"'
  }
})
export class Ventedashboard implements OnInit {
  readonly encaissementPeriodGroups: Array<{ label: string; items: Array<{ label: string; value: VentesEncaissementsPeriod }> }> = [
    {
      label: 'Jour',
      items: [
        { label: "Aujourd'hui", value: 'today' },
        { label: 'Hier', value: 'yesterday' },
      ],
    },
    {
      label: 'Semaine',
      items: [
        { label: 'Cette semaine', value: 'this_week' },
        { label: 'Semaine derniere', value: 'last_week' },
      ],
    },
    {
      label: 'Mois',
      items: [
        { label: 'Ce mois', value: 'this_month' },
        { label: 'Mois dernier', value: 'last_month' },
      ],
    },
    {
      label: 'Annee',
      items: [
        { label: 'Cette annee', value: 'this_year' },
        { label: 'Annee derniere', value: 'last_year' },
      ],
    },
  ];

  cardsLoading = true;

  encaissementPeriod: VentesEncaissementsPeriod = 'today';
  totalFacturesMontant = 0;
  totalFacturesCount = 0;
  facturesPayeesMontant = 0;
  facturesPayeesCount = 0;
  resteAEncaisserMontant = 0;
  facturesImpayeesCount = 0;
  facturesAnnuleesCount = 0;
  private readyForUsineReload = false;

  constructor(
    private dashboardService: DashboardService,
    private usineContext: UsineContextService,
  ) {
    effect(() => {
      this.usineContext.currentUsineId();
      this.usineContext.headerUsineId();
      if (!this.readyForUsineReload) return;
      this.loadCards();
    });
  }

  ngOnInit(): void {
    this.readyForUsineReload = true;
    this.loadCards();
  }

  onEncaissementPeriodChange(period: VentesEncaissementsPeriod): void {
    this.encaissementPeriod = period;
    this.loadCards();
  }

  private loadCards(): void {
    this.cardsLoading = true;
    this.dashboardService.getVentesEncaissements(this.encaissementPeriod).subscribe({
      next: (data) => {
        this.applyEncaissementStats(data);
        this.cardsLoading = false;
      },
      error: () => {
        this.applyEncaissementStats(null);
        this.cardsLoading = false;
      },
    });
  }

  private applyEncaissementStats(data: EncaissementStat | null): void {
    this.totalFacturesMontant = data?.total_factures ?? 0;
    this.totalFacturesCount = data?.nb_factures_total ?? 0;
    this.facturesPayeesMontant = data?.factures_payees ?? 0;
    this.facturesPayeesCount = data?.nb_factures_payees ?? 0;
    this.resteAEncaisserMontant = data?.reste_a_encaisser ?? 0;
    this.facturesImpayeesCount = data?.nb_factures_impayees ?? 0;
    this.facturesAnnuleesCount = data?.nb_factures_annulees ?? 0;
  }

}

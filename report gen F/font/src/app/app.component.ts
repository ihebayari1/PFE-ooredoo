import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EnterpriseThemeService } from './core/services/enterprise-theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'report-builder-ui';

  constructor(private enterpriseThemeService: EnterpriseThemeService) {}

  ngOnInit() {
    // Initialize with default theme
    this.enterpriseThemeService.setDefaultTheme();
  }
}

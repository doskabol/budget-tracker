import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

declare const DG: any;

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './map.html',
  styleUrls: ['./map.css']
})
export class MapComponent implements OnInit {
  private almatyLat = 43.2567;
  private almatyLng = 76.9286;
  private map: any;
  private markers: any[] = []; // Храним маркеры чтобы удалять
  
  // Выбранный тип объектов для отображения
  selectedType = 'all'; // all, banks, atms
  
  // Данные по банкам и банкоматам
  banks = [
    { lat: 43.2582, lng: 76.9286, name: 'Halyk Bank', address: 'ул. Абылай хана, 45', phone: '+7 727 123 4567' },
    { lat: 43.2557, lng: 76.9301, name: 'Jusan Bank', address: 'пр. Достык, 55', phone: '+7 727 234 5678' },
    { lat: 43.2575, lng: 76.9259, name: 'Kaspi Bank', address: 'ул. Пушкина, 120', phone: '+7 727 345 6789' },
    { lat: 43.2600, lng: 76.9220, name: 'Отбасы Банк', address: 'ул. Толе би, 78', phone: '+7 727 456 7890' },
    { lat: 43.2530, lng: 76.9320, name: 'Народный Банк', address: 'пр. Абая, 25', phone: '+7 727 567 8901' },
    { lat: 43.2615, lng: 76.9350, name: 'Банк ЦентрКредит', address: 'ул. Фурманова, 100', phone: '+7 727 678 9012' }
  ];
  
  atms = [
    { lat: 43.2590, lng: 76.9270, name: 'ATM Halyk Bank', address: 'ТЦ "Мега", 1 этаж', bank: 'Halyk Bank' },
    { lat: 43.2565, lng: 76.9295, name: 'ATM Kaspi Bank', address: 'ЖК "Алмалы", вход справа', bank: 'Kaspi Bank' },
    { lat: 43.2540, lng: 76.9260, name: 'ATM Jusan Bank', address: 'АЗС "Гелиос"', bank: 'Jusan Bank' },
    { lat: 43.2620, lng: 76.9330, name: 'ATM Halyk Bank', address: 'БЦ "Нурлы Тау"', bank: 'Halyk Bank' },
    { lat: 43.2515, lng: 76.9340, name: 'ATM Отбасы Банк', address: 'Супермаркет "Small"', bank: 'Отбасы Банк' },
    { lat: 43.2630, lng: 76.9240, name: 'ATM Народный Банк', address: 'ЖД Вокзал Алматы-2', bank: 'Народный Банк' },
    { lat: 43.2570, lng: 76.9200, name: 'ATM ЦентрКредит', address: 'КазНУ, корпус 1', bank: 'Банк ЦентрКредит' }
  ];

  ngOnInit(): void {
    this.load2GISScript();
  }

  load2GISScript() {
    if (document.querySelector('script[src*="maps.api.2gis.ru"]')) {
      this.initMap();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://maps.api.2gis.ru/2.0/loader.js?pkg=full';
    script.onload = () => {
      this.initMap();
    };
    document.head.appendChild(script);
  }

  initMap() {
    DG.then(() => {
      this.map = DG.map('map', {
        center: [this.almatyLat, this.almatyLng],
        zoom: 14
      });
      this.updateMarkers();
    });
  }

  // Обновление маркеров при смене фильтра
  updateMarkers() {
    // Удаляем старые маркеры
    this.markers.forEach(marker => {
      this.map.removeLayer(marker);
    });
    this.markers = [];
    
    // Добавляем новые в зависимости от выбранного типа
    if (this.selectedType === 'banks' || this.selectedType === 'all') {
      this.banks.forEach(bank => {
        this.addBankMarker(bank);
      });
    }
    
    if (this.selectedType === 'atms' || this.selectedType === 'all') {
      this.atms.forEach(atm => {
        this.addAtmMarker(atm);
      });
    }
  }
  
  addBankMarker(bank: any) {
    const marker = DG.marker([bank.lat, bank.lng])
      .addTo(this.map)
      .bindPopup(`
        <div style="font-family: Arial, sans-serif; padding: 8px; min-width: 200px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="font-size: 24px;">🏦</span>
            <strong style="color: #667eea; font-size: 16px;">${bank.name}</strong>
          </div>
          <div style="margin-bottom: 6px;">
            <span style="font-size: 12px; color: #666;">📍 ${bank.address}</span>
          </div>
          <div>
            <span style="font-size: 12px; color: #666;">📞 ${bank.phone}</span>
          </div>
          <div style="margin-top: 8px;">
            <span style="font-size: 11px; color: #10b981;">🕐 Пн-Пт 09:00-18:00</span>
          </div>
        </div>
      `);
    this.markers.push(marker);
  }
  
  addAtmMarker(atm: any) {
    const marker = DG.marker([atm.lat, atm.lng])
      .addTo(this.map)
      .bindPopup(`
        <div style="font-family: Arial, sans-serif; padding: 8px; min-width: 180px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="font-size: 24px;">🏧</span>
            <strong style="color: #667eea; font-size: 16px;">${atm.name}</strong>
          </div>
          <div style="margin-bottom: 4px;">
            <span style="font-size: 12px; color: #666;">🏦 ${atm.bank}</span>
          </div>
          <div>
            <span style="font-size: 12px; color: #666;">📍 ${atm.address}</span>
          </div>
          <div style="margin-top: 8px;">
            <span style="font-size: 11px; color: #10b981;">🕐 Круглосуточно</span>
          </div>
        </div>
      `);
    this.markers.push(marker);
  }
  
  // При изменении выбора
  onTypeChange() {
    this.updateMarkers();
  }
}
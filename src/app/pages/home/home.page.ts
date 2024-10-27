import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { home, apps, reader, person } from 'ionicons/icons';
import { Storage } from '@ionic/storage-angular';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
    displayName: string = '';
    username: string = localStorage.getItem('username') || '';
    hasVehicle: boolean = false;
    showCreateTrip: boolean = false;

    showAddDestination: boolean = false;
    newDestination = {
        place: '',
        image: '',
        departureTime: '',
        departureDate: '',
        description: '',
        createdBy: ''
    };
    

    destinations: any[] = [];
    suggestedDestinations: any[] = [];

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private alertController: AlertController,
        private storage: Storage
    ) {
        addIcons({ home, apps, reader, person });
        this.storage.create();
    }

    async ngOnInit() {
        this.activatedRoute.queryParams.subscribe(params => {
        const navigation = this.router.getCurrentNavigation();
        const state = navigation?.extras.state as { user?: string };
        if (state && state.user) {
            localStorage.setItem('username', state.user);
        }

        this.loadProfile();
        });

        // Cargar destinos desde storage
        this.loadDestinations();
    }

    async loadProfile() {
        const savedProfile = await this.storage.get(`profile_${this.username}`);
        if (savedProfile) {
        this.displayName = `${savedProfile.firstName} ${savedProfile.lastName}`;
        this.hasVehicle = savedProfile.hasVehicle;

        this.showCreateTrip = this.hasVehicle;
        }
    }

    async loadDestinations() {
        this.destinations = await this.storage.get('destinations') || [];
        this.suggestedDestinations = this.getRandomDestinations(this.destinations, 2);
    }

    getRandomDestinations(destinations: any[], count: number) {
        if (destinations.length <= count) {
        return destinations;
        }
        const shuffled = destinations.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    toggleAddDestinationForm() {
        this.showAddDestination = !this.showAddDestination;
    }

    async showAlert() {
        const alert = await this.alertController.create({
        header: 'Información del Usuario',
        message: `Nombre: ${this.displayName}`,
        buttons: ['OK']
        });
        await alert.present();
    }

    logout() {
        this.router.navigate(['/login']);
    }

    goToResetPassword() {
        this.router.navigate(['/reset-password']);
    }

    filterDestinations(event: any) {
        const searchTerm = event.target.value.toLowerCase();
        if (searchTerm && this.destinations.length) {
        this.suggestedDestinations = this.destinations.filter(destination =>
            destination.place.toLowerCase().includes(searchTerm)
        );
        } else {
        this.suggestedDestinations = this.getRandomDestinations(this.destinations, 2);
        }
    }

    goToAddDestination() {
        this.showAddDestination = true;
    }

    goToTravels() {
        this.showAddDestination = false;
    }

    async addDestination() {
        if (this.newDestination.place) {
            this.newDestination.createdBy = this.username;
            this.destinations.push({...this.newDestination});
            await this.storage.set('destinations', this.destinations);
            this.showAddDestination = false;
            this.newDestination = { place: '', image: '', departureTime: '', departureDate: '', description: '', createdBy: '' };
            this.loadDestinations();
        } else {
            const alert = await this.alertController.create({
                header: 'Error',
                message: 'Por favor, introduce un lugar de destino.',
                buttons: ['OK']
            });
            await alert.present();
        }
    }
    
    async clearDestinations() {
        await this.storage.remove('destinations'); // Elimina destinos del storage
        this.destinations = []; // Vacía el array local
        this.suggestedDestinations = []; // Vacía las sugerencias
    }
    
}

import {Component, OnInit} from '@angular/core';
import {CryptoService} from '../services/crypto.service';
import {Router} from '@angular/router';
import {NetworkService} from '../services/network.service';
import {AccountsService} from '../services/accounts.service';

@Component({
	selector: 'app-lockscreen',
	templateUrl: './lockscreen.component.html',
	styleUrls: ['./lockscreen.component.css']
})
export class LockscreenComponent implements OnInit {

	pin = '';
	nAttempts = 5;
	wrongpass = false;
	logoutModal: boolean;
	clearContacts: boolean;
	anim: any;
	lottieConfig: Object;

	static resetApp() {
		window['remote']['app']['relaunch']();
		window['remote']['app'].exit(0);
	}

	constructor(
		private crypto: CryptoService,
		private router: Router,
		private network: NetworkService,
		public aService: AccountsService
	) {
		this.logoutModal = false;
		this.clearContacts = false;
		this.lottieConfig = {
			path: 'assets/logoanim.json',
			autoplay: true,
			loop: false
		};
	}

	ngOnInit() {
		if (localStorage.getItem('simpleos-hash') === null) {
			this.router.navigate(['landing']).catch(() => {
				alert('cannot navigate out');
			});
		}
	}

	handleAnimation(anim: any) {
		this.anim = anim;
		this.anim['setSpeed'](0.8);
	}

	unlock() {
		let target = ['landing'];
		if (this.network.networkingReady.getValue() && this.aService.accounts.length > 0) {
			target = ['dashboard', 'wallet'];
		}
		if (!this.crypto.unlock(this.pin, target)) {
			this.wrongpass = true;
			this.nAttempts--;
			if (this.nAttempts === 0) {
				localStorage.clear();
				LockscreenComponent.resetApp();
			}
		}
	}

	logout() {
		if (this.clearContacts) {
			localStorage.clear();
		} else {
			const arr = [];
			for (let i = 0; i < localStorage.length; i++) {
				if (localStorage.key(i) !== 'simpleos.contacts.' + this.network.activeChain['id']) {
					arr.push(localStorage.key(i));
				}
			}
			arr.forEach((k) => {
				localStorage.removeItem(k);
			});
		}
		LockscreenComponent.resetApp();
	}

}

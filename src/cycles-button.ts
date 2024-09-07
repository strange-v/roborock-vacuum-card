import { LitElement, CSSResultGroup, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import styles from './cycles-button.css';
import { Template } from './types'
import { getCycleIcon } from './resorces'

@customElement('cycles-button')
export class CyclesButton extends LitElement {
    @property()
    public active!: string;
    @property()
    public color: string = '#000';

    static get styles(): CSSResultGroup {
        return styles;
    }

    connectedCallback() {
        super.connectedCallback();

        if (!this.active)
            this.active = '1';
    }

    render(): Template {
        const svgIcon = getCycleIcon(this.active, 24, this.color);
        return html`
        <div class="content" @click=${this._onItemClick}>
            ${svgIcon}
        </div>
        `;
    }

    private _onItemClick() {
        let cycles = parseInt(this.active, 10);
        cycles += 1;

        if (cycles > 3)
            cycles = 1;

        this.active = cycles.toString();
        this.dispatchEvent(new CustomEvent("select", {
            detail: cycles,
        }));
    }
}
import { LitElement, CSSResultGroup, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import styles from './multiselect-button-group.css';
import { Template, Button } from './types'

@customElement('multiselect-button-group')
export class MultiselectButtonGroup extends LitElement {
    @property()
    public buttons!: Button<string>[];
    @state()
    public selection: Record<string, boolean> = {};

    static get styles(): CSSResultGroup {
        return styles;
    }

    connectedCallback() {
        super.connectedCallback();
        this.buttons.forEach(b => this.selection[b.value] = false);
    }

    render(): Template {
        if (!this.buttons)
            return nothing;

        const buttons = this.buttons.map(({icon, text, value}) => {
            const active = this.selection[value] ? 'active' : '';
            
            return html`
                <div class="multiselect-button ${active}" @click=${() => this._onItemClick(value)}>
                    <ha-icon icon="${icon}"></ha-icon> <div class="text">${text}</div>
                </div>
            `;
        });

        return html`
          ${buttons}
        `;
    }

    private _onItemClick(value: string) {
        this.selection[value] = !this.selection[value];
        this.requestUpdate();

        const areas = Object.entries(this.selection)
            .filter(([area, v]) => v)
            .map(([area]) => area);
        this.dispatchEvent(new CustomEvent("select", {
            detail: areas,
        }));
    }
}
import { LitElement, CSSResultGroup, html, svg, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import styles from './segment-button-group.css';
import { Template, SvgButton } from './types'

@customElement('segment-button-group')
export class SegmentButtonGroup extends LitElement {
    @property()
    public buttons!: SvgButton<string>[];
    @property()
    public active!: string;

    static get styles(): CSSResultGroup {
        return styles;
    }

    render(): Template {
        if (!this.buttons)
            return nothing;

        const buttons = this.buttons.map(({ icon, text, value, disabled }) => {
            const active = this.active == value ? 'active' : ''
            const clsDisabled = disabled ? 'disabled' : ''
            const img = icon ? html`${icon}` : nothing;
            const txt = text ? html`<div class="text">${text}</div>` : nothing;
            
            return html`
            <div class="segment-button ${active} ${clsDisabled}" @click=${() => this._onItemClick(value, disabled)}>
                ${img}${txt}
            </div>
            `;
        });

        return html`
          ${buttons}
        `;
    }

    _onItemClick(value: string, disabled?: boolean): void {
        if (this.active === value || disabled)
            return;

        this.active = value;
        this.dispatchEvent(new CustomEvent("select", {
            detail: value,
        }));
    }
}
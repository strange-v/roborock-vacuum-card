import { LitElement, CSSResultGroup, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  fireEvent,
} from 'custom-card-helpers';
import styles from './styles.css';
import buildConfig from './config'
import localize from './localize';
import { VacuumRobot } from './vacuum_robot'
import {
  Template,
  RoborockArea,
  RoborockSensorIds,
  RoborockVacuumCardConfig,
  MyHomeAssistant,
  HassEntity,
  RoborockSuctionMode,
  RoborockMopMode,
} from './types'
import { formatTime } from './format'
import { getSuctionIcon, getMoppingIcon as getMopIcon, getRouteIcon } from './resorces'
import { CustomCleaningPopup } from './custom-cleaning-popup'

typeof (CustomCleaningPopup);

const PKG_VERSION = 'PKG_VERSION_VALUE';

console.info(
  `%c ROBOROCK-VACUUM-CARD %c ${PKG_VERSION}`,
  'color: white; background: black; font-weight: 700;',
  'color: black; background: white; font-weight: 700;',
);

@customElement('roborock-vacuum-card')
export class RoborockVacuumCard extends LitElement {
  @property({ attribute: false })
  public hass!: MyHomeAssistant;
  @state()
  private config!: RoborockVacuumCardConfig;
  @state()
  private popupActive: boolean = false;

  private iconColor: string = '#000';
  private robot!: VacuumRobot;

  get name(): string {
    return this.config.entity.replace('vacuum.', '');
  }

  get sensor(): RoborockSensorIds {
    const name = this.name;
    return {
      reachStatus: `sensor.${name}_status`,
      cleaning: `binary_sensor.${name}_cleaning`,
      mopDrying: `binary_sensor.${name}_mop_drying`,
      mopDryingRemainingTime: `sensor.${name}_mop_drying_remaining_time`,
      battery: `sensor.${name}_battery`,
      vacuumError: `sensor.${name}_vacuum_error`,
      docError: `sensor.${name}_dock_error`,
    };
  }

  static get styles(): CSSResultGroup {
    return styles;
  }

  constructor() {
    super();
    this.robot = new VacuumRobot();
  }

  setConfig(config: RoborockVacuumCardConfig) {
    this.config = buildConfig(config);
    this.robot.setEntity(this.config.entity);
  }

  getCardSize(): Number {
    return 3;
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  private onPopupShow(event: MouseEvent) {
    event.stopPropagation();
    this.popupActive = true;
  }

  private onPopupClose(event: MouseEvent) {
    event.stopPropagation();
    this.popupActive = false;
  }

  protected render(): Template {
    if (!this.hass || !this.config)
      return nothing;

    this.iconColor = this.hass.themes.darkMode ? '#fff' : '#000';
    this.robot.setHass(this.hass);

    const isCleaning = this.state(this.sensor.cleaning) == 'on';
    const state = this.state(this.config.entity);
    const reachState = this.state(this.sensor.reachStatus);
    const errors = this.renderErrors();
    const name = this.renderName();
    const mode = this.renderMode();
    const mopDrying = this.renderMopDrying();
    const battery = this.renderBattery();
    const combinedState = state == reachState
      ? localize(`status.${state}`)
      : localize(`status.${state}`) + '. ' + localize(`reach_status.${reachState}`) + '.';
    const stats = this.renderStats(isCleaning ? 'cleaning' : state);
    const actions = this.renderActions(isCleaning, state);

    const popup = this.renderPopup();

    return html`
      <ha-card>
        <div class="header">
          ${name}
          ${mode}
          ${mopDrying}
          ${battery}
        </div>
        <div class="content" @click=${this.onPopupShow}>
          ${errors}
          <div class="state">
            ${combinedState}
          </div>
        </div>
        ${stats}
        <div class="actions">
          ${actions}
        </div>
      </ha-card>
      ${popup}
    `;
  }

  private renderPopup(): Template {
    if (!this.hass || !this.config || !this.config.areas || !this.popupActive)
      return nothing;

    const areas = this.getAreas();

    return html`
      <custom-cleaning-popup robot=${this.robot} areas=${areas} iconColor=${this.iconColor} @close=${this.onPopupClose}></custom-cleaning-popup>
    `;
  }

  private renderErrors(): Template {
    if (!this.hass || !this.config)
      return nothing;

    const rawVacuumError = this.hass.states[this.sensor.vacuumError].state,
      rawDocError = this.hass.states[this.sensor.docError].state,
      vacuumError = `vacuum_error.${rawVacuumError}`,
      docError = `doc_error.${rawDocError}`,
      isVacuumError = rawVacuumError != "none",
      isdocError = rawDocError != 'ok';

    let vacuum: Template = nothing;
    if (isVacuumError) {
      vacuum = html`
        ${localize('common.vacuum_error')}: ${localize(vacuumError)}.<br/>
      `;
    }

    let doc: Template = nothing;
    if (isdocError) {
      doc = html`
        ${localize('common.doc_error')}: ${localize(docError)}.
      `;
    }

    if (!isVacuumError && !isdocError)
      return nothing;

    return html`
      <div class="errors">
        ${vacuum}
        ${doc}
      </div>
    `;
  }

  private renderStats(state: string): Template {
    const statsList =
      this.config.stats[state] || this.config.stats.default || [];

    const stats = statsList.map(
      ({ entity, attribute, scale, divide_by, unit, title }) => {
        if (!entity && !attribute)
          return nothing;

        let state = '';

        if (entity && attribute) {
          state = this.getAttributeValue(this.hass.states[entity], attribute);
        } else if (attribute) {
          state = this.getAttributeValue(this.hass.states[this.config.entity], attribute);
        } else if (entity) {
          state = this.hass.states[entity].state;
        } else {
          return nothing;
        }

        const needProcessing = scale != null || divide_by != null;
        if (needProcessing) {
          let value = parseFloat(state);

          if (divide_by != null && divide_by > 0)
            value = value / divide_by;

          if (scale != null)
            state = value.toFixed(scale);
          else
            state = value.toString();
        }

        return html`
          <div class="stats-block" @click="${() => this.handleMore(entity)}">
            <span class="stats-value">${state}</span>
            ${unit}
            <div class="stats-subtitle">${title}</div>
          </div>
        `;
      },
    );

    if (!stats.length) {
      return nothing;
    }

    return html`<div class="stats">${stats}</div>`;
  }

  private renderActions(isCleaning: boolean, state: string) {
    if (isCleaning) {
      const pauseResume = state == 'paused'
        ? html`
        <paper-button @click="${this.handleVacuumAction('start')}">
          <ha-icon icon="hass:play"></ha-icon>
          ${localize('common.resume')}
        </paper-button>`
        : html`
        <paper-button @click="${this.handleVacuumAction('pause')}">
          <ha-icon icon="hass:pause"></ha-icon>
          ${localize('common.pause')}
        </paper-button>`;
      
      return html`
      ${pauseResume}
      <paper-button @click="${this.handleVacuumAction('stop')}">
        <ha-icon icon="hass:stop"></ha-icon>
        ${localize('common.stop')}
      </paper-button>
      <paper-button @click="${this.handleVacuumAction('return_to_base')}">
        <ha-icon icon="hass:home-map-marker"></ha-icon>
        ${localize('common.return_to_base')}
      </paper-button>
      `;
    } else {
      return html`
      <paper-button @click="${this.handleVacuumAction('start')}">
        <ha-icon icon="hass:play"></ha-icon>
        ${localize('common.start')}
      </paper-button>
      <paper-button @click="${this.handleVacuumAction('locate')}">
      <ha-icon icon="mdi:map-marker"></ha-icon>
      ${localize('common.locate')}
      </paper-button>
      `;
    }
  }

  private renderName(): Template {
    const entity = this.hass.states[this.config.entity];
    const data = {
      friendly_name: this.getAttributeValue(entity, 'friendly_name'),
      icon: this.getAttributeValue(entity, 'icon'),
    };

    return html`
      <div class="tip" @click="${() => this.handleMore(this.config.entity)}">
        <ha-icon icon="${data.icon}"></ha-icon>
        <span class="icon-title">${data.friendly_name}</span>
      </div>
    `;
  }

  private renderMode(): Template {
    const icons = [],
      suction = this.robot.getSuctionMode(),
      mop = this.robot.getMopMode(),
      route = this.robot.getRouteMode();

    if (suction != RoborockSuctionMode.Off)
      icons.push(getSuctionIcon(suction, 24, '#fff'));
    if (mop != RoborockMopMode.Off)
      icons.push(getMopIcon(mop, 24, '#fff'));
    icons.push(getRouteIcon(route, 24, '#fff'));

    const result = icons.map(icon => html`<div class="tip">${icon}</div>`)

    return html`
    <div class="modes" @click=${this.onPopupShow}>
      ${result}
    </div>
    `;
  }

  private renderMopDrying(): Template {
    const mopDryingEntity = this.hass.states[this.sensor.mopDrying];
    if (!mopDryingEntity)
      return nothing;

    const isDrying = mopDryingEntity.state;
    if (isDrying != 'on')
      return nothing;

    const timeLeft = Number(this.hass.states[this.sensor.mopDryingRemainingTime].state);

    return html`
      <div class="tip" @click="${() => this.handleMore(this.sensor.mopDryingRemainingTime)}">
        <ha-icon icon="mdi:heat-wave"></ha-icon>
        <span class="icon-title">${formatTime(timeLeft)}</span>
      </div>
    `;
  }

  private renderBattery(): Template {
    const entity = this.hass.states[this.config.entity];
    const data = {
      battery_level: this.getAttributeValue(entity, 'battery_level'),
      battery_icon: this.getAttributeValue(entity, 'battery_icon'),
    };

    return html`
      <div class="tip" @click="${() => this.handleMore(this.sensor.battery)}">
        <ha-icon icon="${data.battery_icon}"></ha-icon>
        <span class="icon-title">${data.battery_level}%</span>
      </div>
    `;
  }

  private handleVacuumAction(action: string) {
    return () => this.robot.callServiceAsync(action);
  }

  private handleMore(entityId?: string): void {
    fireEvent(
      this,
      'hass-more-info',
      {
        entityId,
      },
      {
        bubbles: false,
        composed: true,
      },
    );
  }

  private getAreas() {
    const areas: RoborockArea[] = [];

    if (!this.config.areas)
      return areas;

    for (let { area_id, roborock_area_id } of this.config.areas) {
      const area = this.hass.areas[area_id];
      if (!area)
          continue;

      areas.push({
        icon: area.icon,
        name: area.name,
        area_id,
        roborock_area_id,
      });
    }

    return areas;
  }

  private getAttributeValue(entity: HassEntity, attribute: string) {
    return entity.attributes[attribute];
  }

  private state(id: string): string {
    return this.hass.states[id].state;
  }
}

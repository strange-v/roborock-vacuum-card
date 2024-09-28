import { LitElement, CSSResultGroup, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import styles from './custom-cleaning-popup.css';
import { getSuctionIcon, getMoppingIcon, getRouteIcon } from './resorces'
import localize from './localize';
import { VacuumRobot } from './vacuum_robot'
import {
  Template,
  StringEvent,
  StringArrayEvent,
  Button,
  SvgButton,
  RoborockCleaningMode,
  RoborockSuctionMode,
  RoborockMopMode,
  RoborockRouteMode,
  RoborockArea,
} from './types'
import { MultiselectButtonGroup } from './multiselect-button-group'
import { SegmentButtonGroup } from './segment-button-group'
import { CyclesButton } from './cycles-button'

typeof (MultiselectButtonGroup);
typeof (SegmentButtonGroup);
typeof (CyclesButton);

@customElement('custom-cleaning-popup')
export class CustomCleaningPopup extends LitElement {
  @property()
  public robot!: VacuumRobot;
  @property()
  public areas: RoborockArea[] = [];
  @property()
  public iconColor: string = '#000';

  @state()
  private popupRequestInProgress: boolean = false;
  @state()
  private activeCleaningMode: RoborockCleaningMode = RoborockCleaningMode.VacAndMop;
  @state()
  private activeSuctionMode: RoborockSuctionMode = RoborockSuctionMode.Turbo;
  @state()
  private activeMopMode: RoborockMopMode = RoborockMopMode.Moderate;
  @state()
  private activeRouteMode: RoborockRouteMode = RoborockRouteMode.Standard;
  @state()
  private activeCycleMode: string = '1';

  private activeAreas: string[] = [];
  private cleaningModes: Button<string>[] = [];
  private suctionModes: SvgButton<string>[] = [];
  private mopModes: SvgButton<string>[] = [];
  private routeModes: SvgButton<string>[] = [];

  static get styles(): CSSResultGroup {
    return styles;
  }

  connectedCallback() {
    super.connectedCallback();
    
    this.cleaningModes = [{
      text: localize('mode.vac&mop'),
      value: RoborockCleaningMode.VacAndMop
    }, {
      text: localize('mode.mop'),
      value: RoborockCleaningMode.Mop
    }, {
      text: localize('mode.vac'),
      value: RoborockCleaningMode.Vac
    }];

    this.activeSuctionMode = this.robot.getSuctionMode();
    this.activeMopMode = this.robot.getMopMode();
    this.activeRouteMode = this.robot.getRouteMode();
    
    if (this.activeSuctionMode == RoborockSuctionMode.Off)
      this.activeCleaningMode = RoborockCleaningMode.Mop;
    else if (this.activeMopMode == RoborockMopMode.Off)
      this.activeCleaningMode = RoborockCleaningMode.Vac;
    else
      this.activeCleaningMode = RoborockCleaningMode.VacAndMop;
  }

  private onCleaningModeChange(e: StringEvent) {
    const cleaningMode = e.detail as RoborockCleaningMode;;
    this.activeCleaningMode = cleaningMode;
    this.fixModesIfNeeded();
  }

  private onSuctionModeChange(e: StringEvent) {
    this.activeSuctionMode = e.detail as RoborockSuctionMode;
  }

  private onMoppingModeChange(e: StringEvent) {
    this.activeMopMode = e.detail as RoborockMopMode;
  }

  private onRouteModeChange(e: StringEvent) {
    this.activeRouteMode = e.detail as RoborockRouteMode;
  }

  private onCycleModeChange(e: StringEvent) {
    this.activeCycleMode = e.detail;
  }

  private onAreasChange(e: StringArrayEvent) {
    this.activeAreas = e.detail;
    this.requestUpdate();
  }

  private async onRunCleaning() {
    const delay = 100;

    if (this.activeAreas.length == 0)
      return;

    this.popupRequestInProgress = true;

    this.fixModesIfNeeded();
    await this.robot.setSuctionModeAsync(this.activeSuctionMode as RoborockSuctionMode);
    await new Promise(r => setTimeout(r, delay));
    await this.robot.setMopModeAsync(this.activeMopMode as RoborockMopMode);
    await new Promise(r => setTimeout(r, delay));
    await this.robot.setRouteModeAsync(this.activeRouteMode as RoborockRouteMode);
    await new Promise(r => setTimeout(r, delay));

    const area_ids = this.activeAreas.map(v => parseInt(v, 10));
    await this.robot.startSegmentsCleaningAsync(area_ids, parseInt(this.activeCycleMode, 10));

    this.closePopup();
    this.popupRequestInProgress = false;
  }

  private onPopupClose(event: MouseEvent) {
    event.stopPropagation();
    this.closePopup();
  }

  private onPopupBackgroundClick(e: MouseEvent) {
    const target = e.target as Element;
    if (!target || !target.classList.contains('popup-background'))
      return;

    this.closePopup();
  }

  private closePopup() {
    this.activeAreas = [];
    this.dispatchEvent(new CustomEvent('close'));
  }

  render(): Template {
    const suctionMode = this.renderSuctionMode();
    const moppingMode = this.renderMoppingMode();
    const routeMode = this.renderRouteMode();
    const areas = this.renderAreas();
    const progress = this.renderProgress();

    return html`
      <div class="popup-background" @click=${this.onPopupBackgroundClick}>
        <div class="popup-card">
          <div class="header">
            <ha-icon-button icon="mdi:close" @click=${this.onPopupClose} ><ha-icon icon="mdi:close"></ha-icon></ha-icon-button>
            <div class="text">${localize(`common.custom_cleaning`)}</div>
          </div>
          <div class="content">
            <div class="parameters">
              <segment-button-group buttons=${this.cleaningModes} active=${this.activeCleaningMode} @select=${this.onCleaningModeChange}></segment-button-group>
              ${suctionMode}
              ${moppingMode}
              ${routeMode}
              <cycles-button active=${this.activeCycleMode} color=${this.iconColor} @select=${this.onCycleModeChange}></cycles-button>
            </div>
            ${areas}
          </div>
          <div class="actions">
            <button class="clean-button ${this.activeAreas.length == 0 ? 'disabled' : ''}" @click=${this.onRunCleaning}>CLEAN</button>
          </div>
          ${progress}
        </div>
      </div>
    `;
  }

  private renderProgress(): Template {
    if (!this.popupRequestInProgress)
      return nothing;

    return html`
    <div class="progress">
      <ha-circular-progress indeterminate=true size="large"></ha-circular-progress>
    </div>
    `;
  }

  private renderSuctionMode(): Template {
    if (this.activeCleaningMode == RoborockCleaningMode.Mop)
      return nothing;

    this.suctionModes = Object.values(RoborockSuctionMode)
      .map(v => ({ icon: getSuctionIcon(v, 24, this.iconColor), value: v, disabled: !this.isSupportedSuctionMode(v, this.activeCleaningMode) }));
    const mode = localize(`suction_mode.${this.activeSuctionMode}`);

    return html`
      <div class="mode-title">
        <div class="title">${localize('common.suction_mode')}</div>
        <div class="value">${mode}</div>
      </div>
      <segment-button-group buttons=${this.suctionModes} active=${this.activeSuctionMode} @select=${this.onSuctionModeChange}></segment-button-group>
    `;
  }

  private renderMoppingMode(): Template {
    if (this.activeCleaningMode == RoborockCleaningMode.Vac)
      return nothing;

    this.mopModes = Object.values(RoborockMopMode)
      .map(v => ({ icon: getMoppingIcon(v, 24, this.iconColor), value: v, disabled: !this.isSupportedMopMode(v, this.activeCleaningMode) }));
    const mode = localize(`mop_mode.${this.activeMopMode}`);

    return html`
      <div class="mode-title">
        <div class="title">${localize('common.mop_mode')}</div>
        <div class="value">${mode}</div>
      </div>
      <segment-button-group buttons=${this.mopModes} active=${this.activeMopMode} @select=${this.onMoppingModeChange}></segment-button-group>
    `;
  }

  private renderRouteMode(): Template {
    this.routeModes = Object.values(RoborockRouteMode)
      .map(v => ({ icon: getRouteIcon(v, 24, this.iconColor), value: v, disabled: !this.isSupportedRouteMode(v, this.activeCleaningMode) }));
    const mode = localize(`route_mode.${this.activeRouteMode}`);

    return html`
      <div class="mode-title">
        <div class="title">${localize('common.route_mode')}</div>
        <div class="value">${mode}</div>
      </div>
      <segment-button-group buttons=${this.routeModes} active=${this.activeRouteMode} @select=${this.onRouteModeChange}></segment-button-group>
    `;
  }

  private renderAreas(): Template {
    const areas = this.areas
      .map(area => {
        return {
          icon: area.icon,
          text: area.name,
          value: area.roborock_area_id.toString()
        }
      });

    return html`
      <div class="areas">
        <multiselect-button-group buttons="${areas}" @select="${this.onAreasChange}"></multiselect-button-group>
      </div>
    `;
  }

  private fixModesIfNeeded() {
    if (!VacuumRobot.isSupportedSuctionMode(this.activeSuctionMode, this.activeCleaningMode))
      this.activeSuctionMode = this.activeCleaningMode == RoborockCleaningMode.Mop ? RoborockSuctionMode.Off : RoborockSuctionMode.Turbo;
    if (!VacuumRobot.isSupportedMopMode(this.activeMopMode, this.activeCleaningMode))
      this.activeMopMode = this.activeCleaningMode == RoborockCleaningMode.Vac ? RoborockMopMode.Off : RoborockMopMode.Moderate;
    if (!VacuumRobot.isSupportedRouteMode(this.activeRouteMode, this.activeCleaningMode))
      this.activeRouteMode = RoborockRouteMode.Standard;
  }

  private isSupportedSuctionMode(mode: RoborockSuctionMode, cleaningMode: RoborockCleaningMode): boolean {
    if (mode == RoborockSuctionMode.Off)
      return false;
    return VacuumRobot.isSupportedSuctionMode(mode, cleaningMode);
  }

  private isSupportedMopMode(mode: RoborockMopMode, cleaningMode: RoborockCleaningMode): boolean {
    if (mode == RoborockMopMode.Off)
      return false;
    return VacuumRobot.isSupportedMopMode(mode, cleaningMode);
  }

  private isSupportedRouteMode(mode: RoborockRouteMode, cleaningMode: RoborockCleaningMode): boolean {
    return VacuumRobot.isSupportedRouteMode(mode, cleaningMode);
  }
}
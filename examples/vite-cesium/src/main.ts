import './style.css';
import { Rectangle, Viewer } from 'cesium';
import { createLayer } from 'wiselayer';
import type { ILayer } from 'wiselayer';
import 'cesium/Build/Cesium/Widgets/widgets.css';

interface LayerPanelItem {
  id: string;
  title: string;
  subtitle: string;
  layer: ILayer;
  defaultVisible: boolean;
  defaultAlpha: number;
  defaultZIndex: number;
}

const viewer = new Viewer('cesiumContainer', {
  animation: false,
  timeline: false,
  baseLayerPicker: false,
  geocoder: false,
  homeButton: false,
  sceneModePicker: false,
  navigationHelpButton: false,
  fullscreenButton: false,
});

viewer.imageryLayers.removeAll();

const layerItems: LayerPanelItem[] = [
  {
    id: 'wmts-world',
    title: 'WMTS · 全球影像',
    subtitle: 'ArcGIS World Imagery',
    layer: createLayer({
      type: 'wmts',
      name: 'World Imagery',
      url: 'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/WMTS',
      layer: 'World_Imagery',
      style: 'default',
      format: 'image/jpeg',
      tileMatrixSetID: 'default028mm',
      maximumLevel: 19,
      rectangle: Rectangle.fromDegrees(-180, -85, 180, 85),
      zIndex: 0,
    }),
    defaultVisible: true,
    defaultAlpha: 1,
    defaultZIndex: 0,
  },
  {
    id: 'wms-states',
    title: 'WMS · 美国各州',
    subtitle: 'GeoServer topp:states',
    layer: createLayer({
      type: 'wms',
      name: 'US States',
      url: 'https://ahocevar.com/geoserver/wms',
      layers: 'topp:states',
      crs: 'EPSG:4326',
      format: 'image/png',
      rectangle: Rectangle.fromDegrees(-125, 24, -66, 50),
      zIndex: 1,
    }),
    defaultVisible: true,
    defaultAlpha: 0.85,
    defaultZIndex: 1,
  },
];

for (const item of layerItems) {
  item.layer.addTo(viewer);
  item.layer.setAlpha(item.defaultAlpha);
  item.layer.setVisible(item.defaultVisible);
}

const maxZIndex = layerItems.length - 1;

function syncZIndexControls(container: HTMLElement, items: LayerPanelItem[]): void {
  for (const item of items) {
    const section = container.querySelector<HTMLElement>(`[data-layer-id="${item.id}"]`);
    const zIndexInput = section?.querySelector<HTMLInputElement>('[data-action="zindex"]');
    if (zIndexInput) {
      zIndexInput.value = String(item.layer.getZIndex());
    }
  }
}

function renderLayerList(container: HTMLElement, items: LayerPanelItem[]): void {
  container.innerHTML = items
    .map(
      (item) => `
        <section class="layer-item" data-layer-id="${item.id}">
          <div class="layer-header">
            <div>
              <h2>${item.title}</h2>
              <p class="layer-subtitle">${item.subtitle}</p>
            </div>
            <button type="button" class="locate-btn" data-action="locate">定位</button>
          </div>
          <label class="row">
            <span>显示图层</span>
            <input type="checkbox" data-action="visible" ${item.defaultVisible ? 'checked' : ''} />
          </label>
          <label class="row">
            <span>透明度</span>
            <input
              type="range"
              data-action="alpha"
              min="0"
              max="1"
              step="0.05"
              value="${item.defaultAlpha}"
            />
          </label>
          <label class="row">
            <span>层级</span>
            <div class="zindex-control">
              <input
                type="number"
                data-action="zindex"
                min="0"
                max="${maxZIndex}"
                step="1"
                value="${item.defaultZIndex}"
              />
              <span class="zindex-hint">越大越靠上</span>
            </div>
          </label>
        </section>
      `,
    )
    .join('');

  for (const item of items) {
    const section = container.querySelector<HTMLElement>(`[data-layer-id="${item.id}"]`);
    if (!section) {
      continue;
    }

    const visibleInput = section.querySelector<HTMLInputElement>('[data-action="visible"]');
    const alphaInput = section.querySelector<HTMLInputElement>('[data-action="alpha"]');
    const zIndexInput = section.querySelector<HTMLInputElement>('[data-action="zindex"]');
    const locateButton = section.querySelector<HTMLButtonElement>('[data-action="locate"]');

    visibleInput?.addEventListener('change', () => {
      item.layer.setVisible(visibleInput.checked);
    });

    alphaInput?.addEventListener('input', () => {
      item.layer.setAlpha(Number(alphaInput.value));
    });

    zIndexInput?.addEventListener('change', () => {
      const nextIndex = Number(zIndexInput.value);
      if (!Number.isFinite(nextIndex)) {
        syncZIndexControls(container, items);
        return;
      }

      try {
        item.layer.setZIndex(nextIndex);
        syncZIndexControls(container, items);
      } catch (error) {
        const message = error instanceof Error ? error.message : '层级设置失败';
        window.alert(message);
        syncZIndexControls(container, items);
      }
    });

    locateButton?.addEventListener('click', () => {
      try {
        item.layer.centerAt({ duration: 1.5 });
      } catch (error) {
        const message = error instanceof Error ? error.message : '定位失败';
        window.alert(message);
      }
    });
  }

  syncZIndexControls(container, items);
}

const layerList = document.getElementById('layerList');
if (layerList) {
  renderLayerList(layerList, layerItems);
}

layerItems.find((item) => item.id === 'wms-states')?.layer.centerAt({ duration: 0 });

# Roborock Vacuum Card

Home Assistant vacuum card that uses core Roborock integration and supports multi-selecting areas for cleaning.

![Roborock Vacuum Card](/images/roborock-vacuum-card.png)

![Roborock Vacuum Card custom cleaning](/images/roborock-vacuum-card-popup.png)

## Caveat

This card is not highly configurable and was created for personal use. It expects (and was tested with) the Roborock S8 Pro Ultra vacuum robot and dock.

## Card configuration

```yaml
type: custom:roborock-vacuum-card
entity: vacuum.robot
stats:
  default:
    - entity: sensor.robot_filter_time_left
      divide_by: 3600
      scale: 1
      title: Filter
      unit: h
    - entity: sensor.robot_side_brush_time_left
      divide_by: 3600
      scale: 1
      title: Side brush
      unit: h
    - entity: sensor.robot_main_brush_time_left
      divide_by: 3600
      scale: 1
      unit: h
      title: Main brush
    - entity: sensor.robot_sensor_time_left
      divide_by: 3600
      scale: 1
      unit: h
      title: Sensors
  cleaning:
    - entity: sensor.robot_cleaning_progress
      title: Cleaning progress
      unit: '%'
    - entity: sensor.robot_cleaning_area
      title: Cleaning area
      unit: m²
    - entity: sensor.robot_cleaning_time
      divide_by: 60
      scale: 1
      title: Cleaning time
      unit: min
areas:
  - area_id: living_room
    roborock_area_id: 12
  - area_id: master_bedroom
    roborock_area_id: 13
  - area_id: kids_bedroom
    roborock_area_id: 14
  - area_id: kitchen
    roborock_area_id: 15
  - area_id: bathroom
    roborock_area_id: 16
  - area_id: toilet
    roborock_area_id: 17
  - area_id: corridor
    roborock_area_id: 18
  - area_id: hallway
    roborock_area_id: 19
```

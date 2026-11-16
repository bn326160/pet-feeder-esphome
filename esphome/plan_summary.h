#pragma once
// One-line overview of a schedule for the "Weekday plan" / "Weekend plan" text sensors,
// e.g. "07:15 ×2 · 11:30 ×1 · 15:30 off · 19:00 ×1 · 23:00 ×2".
#include <cstdio>
#include <initializer_list>
#include <string>
#include "esphome/components/datetime/time_entity.h"
#include "esphome/components/number/number.h"
#include "esphome/components/switch/switch.h"

struct PlanSlot {
  esphome::datetime::TimeEntity *time;
  esphome::number::Number *portions;
  esphome::switch_::Switch *enabled;
};

inline std::string plan_summary(std::initializer_list<PlanSlot> slots, bool schedule_on) {
  std::string out = schedule_on ? "" : "PAUSED · ";
  bool first = true;
  for (const auto &s : slots) {
    const int n = (int) s.portions->state;
    const bool on = s.enabled->state && n > 0;
    char buf[24];
    if (on)
      snprintf(buf, sizeof(buf), "%02d:%02d ×%d", s.time->hour, s.time->minute, n);
    else
      snprintf(buf, sizeof(buf), "%02d:%02d off", s.time->hour, s.time->minute);
    if (!first) out += " · ";
    out += buf;
    first = false;
  }
  return out;
}

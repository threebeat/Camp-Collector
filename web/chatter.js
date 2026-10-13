import { dialogue } from "./data.js?v=19";

// One small comment at a time, with independently sampled gaps and speakers.
export class CampChatter {
  constructor(random = Math.random) {
    this.random = random;
    this.nextAt = null;
    this.speaker = null;
    this.until = 0;
    this.line = "";
    this.previous = null;
  }
  update(now, heroes) {
    if (this.nextAt === null) this.nextAt = now + 25000 + this.random() * 45000;
    if (this.speaker && !heroes.some((h) => h.id === this.speaker)) {
      this.speaker = null;
      this.until = 0;
    }
    if (!heroes.length || now < this.nextAt) return;
    const candidates = heroes.filter((h) => h.id !== this.previous),
      list = candidates.length ? candidates : heroes,
      h = list[Math.floor(this.random() * list.length)];
    this.speaker = h.id;
    this.previous = h.id;
    this.line = dialogue(h, "camp", Math.floor(this.random() * 1000));
    this.until = now + 3400;
    this.nextAt = now + 60000 + this.random() * 110000;
  }
  forHero(id, now) {
    return id === this.speaker && now < this.until ? this.line : "";
  }
}

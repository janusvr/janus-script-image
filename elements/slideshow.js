room.registerElement('slideshow', {
  active: 0,
  count: 0,
  fadesize: 5,
  autoplay: true,
  autoplaytime: 5000,

  createChildren: function() {
    this.count = this.children.length;

    // Inifialize children
    this.springs = [];
    this.friction = [];
    for (var i = 0; i < this.count; i++) {
      var child = this.children[i];
      child.pos = V(i,0,0);
      child.mass = 1;
      child.collision_trigger = true;

      // Add forces
      this.springs[i] = child.addForce('spring', {strength: 200, anchor: this.localToWorld(V(0))});
      this.friction[i] = child.addForce('friction', 10); // damping force

      // Add event listeners
      child.addEventListener('click', this.handleClick);
      child.addEventListener('mouseover', this.handleMouseOver);
      child.addEventListener('mouseout', this.handleMouseOut);
      child.addEventListener('touchstart', this.handleTouchStart);
    }

    this.dragoffset = V();
    this.updateVisible();

    if (this.autoplay) {
      this.startAutoplay();
    }
  },
  startAutoplay: function() {
    this.clearAutoplay();
    this.autoplaytimer = setTimeout(this.advance, this.autoplaytime);
  },
  clearAutoplay: function() {
    if (this.autoplaytimer) {
      clearTimeout(this.autoplaytimer);
      this.autoplaytimer = false;
    }
  },
  advance: function() {
    this.setActive((this.active + 1) % this.count);
  },
  back: function() {
    this.setActive((this.count + this.active - 1) % this.count);
  },
  setActive: function(num) {
    this.active = num;
    this.updateVisible();
    if (this.autoplay) {
      this.startAutoplay();
    }
  },
  handleMouseOver: function(ev) {
    //ev.target.opacity = 1;
  },
  handleMouseOut: function(ev) {
    var relpos = this.active - this.children.indexOf(ev.target);
    //ev.target.opacity = this.getOpacityForPosition(relpos);
  },
  handleClick: function(ev) {
    var idx = this.children.indexOf(ev.target);
    this.setActive(idx);
  },
  handleTouchStart: function(ev) {
    this.clearAutoplay();
    this.touchstartpos = this.worldToLocal(ev.data.point);
    ev.preventDefault();
    ev.stopPropagation();
    room.addEventListener('touchmove', this.handleTouchMove);
    window.addEventListener('touchend', this.handleTouchEnd);

    var idx = this.children.indexOf(ev.target);
    this.springs[idx].update({strength: 2000});
    this.dragchildid = idx;
  },
  handleTouchMove: function(ev) {
    var localpos = this.worldToLocal(ev.data.point);
    var dir = localpos.x - this.touchstartpos.x;

    this.dragoffset.x = dir;
    this.updateVisible(true);
    ev.preventDefault();
    //ev.stopPropagation();

  },
  handleTouchEnd: function(ev) {
    var offset = this.dragoffset.x;
    this.dragoffset.x = 0;
    if (offset > 0) {
      this.back();
    } else if (offset < 0) {
      this.advance();
    }
    ev.stopPropagation();
    room.removeEventListener('touchmove', this.handleTouchMove);
    window.removeEventListener('touchend', this.handleTouchEnd);

    this.springs[this.dragchildid].update({strength: 200});
    this.dragchildid = false;
  },
  getOpacityForPosition: function(relpos) {
    var fadescale = (Math.min(this.fadesize, Math.abs(relpos)) / this.fadesize);
    return Math.max(0, (relpos == 0 ? 1 : .9 - fadescale));
  },
  updateVisible: function(skipwake) {
    for (var i = 0; i < this.count; i++) {
      var child = this.children[i];
      var relpos = this.active - i;
      //child.opacity = this.getOpacityForPosition(relpos);
      //child.col = scalarMultiply(V(1), this.getOpacityForPosition(relpos));
      if (!skipwake) child.vel = V(.01,0,0);
      child.scale = V(relpos == 0 ? 2 : 1)
      var attachpoint = -2.5 * relpos + (relpos < 0 ? 1.5 : (relpos > 0 ? -1.5 : 0));
      this.springs[i].update({strength: 80, anchor: this.localToWorld(translate(this.dragoffset, V(attachpoint, 0, 0)))});
    }
  }
});


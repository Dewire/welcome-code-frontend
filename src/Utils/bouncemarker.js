/*eslint-disable */
/**
 * Copyright (C) 2013 Maxime Hadjinlian <maxime.hadjinlian@gmail.com>
 * All Rights Reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * - Redistributions of source code must retain the above copyright notice,
 *   this list of conditions and the following disclaimer.
 *
 * - Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

(function () {
  // Retain the value of the original onAdd and onRemove functions
  const originalOnAdd = L.Marker.prototype.onAdd;
  const originalOnRemove = L.Marker.prototype.onRemove;

  // Add bounceonAdd options
  L.Marker.mergeOptions({
    bounceOnAdd: false,
    bounceOnAddOptions: {
      duration: 1000,
      height: -1,
    },
    bounceOnAddCallback() {},
  });

  L.Marker.include({

    _toPoint(latlng) {
      return this._map.latLngToContainerPoint(latlng);
    },
    _toLatLng(point) {
      return this._map.containerPointToLatLng(point);
    },

    _motionStep(timestamp, opts) {
      const self = this;
      const timePassed = new Date() - opts.start;
      let progress = timePassed / opts.duration;

      if (progress > 1) {
        progress = 1;
      }
      const delta = self._easeOutBounce(progress);
      opts.step(delta);

      if (progress === 1) {
        opts.end();
        return;
      }

      L.Util.requestAnimFrame((timestamp) => {
        self._motionStep(timestamp, opts);
      });
    },

    _bounceMotion(duration, callback) {
      const original = L.latLng(this._origLatlng);
      const start_y = this._dropPoint.y;
      const start_x = this._dropPoint.x;
      const distance = this._point.y - start_y;
      const self = this;

      L.Util.requestAnimFrame((timestamp) => {
        self._motionStep(timestamp, {
          delay: 10,
          duration: duration || 1000, // 1 sec by default
          start: new Date(),
          step(delta) {
            self._dropPoint.y =
              start_y
            + (distance * delta)
            - (self._map.project(self._map.getCenter()).y - self._origMapCenter.y);
            self._dropPoint.x =
              start_x
            - (self._map.project(self._map.getCenter()).x - self._origMapCenter.x);
            self.setLatLng(self._toLatLng(self._dropPoint));
          },
          end() {
            self.setLatLng(original);
            if (typeof callback === 'function') callback();
          },
        });
      });
    },

    // Many thanks to Robert Penner for this function
    _easeOutBounce(pos) {
      if ((pos) < (1 / 2.75)) {
        return (7.5625 * pos * pos);
      } else if (pos < (2 / 2.75)) {
        return (7.5625 * (pos -= (1.5 / 2.75)) * pos + 0.75);
      } else if (pos < (2.5 / 2.75)) {
        return (7.5625 * (pos -= (2.25 / 2.75)) * pos + 0.9375);
      }
      return (7.5625 * (pos -= (2.625 / 2.75)) * pos + 0.984375);
    },

    // Bounce : if options.height in pixels is not specified, drop from top.
    // If options.duration is not specified animation is 1s long.
    bounce(options, endCallback) {
      this._origLatlng = this.getLatLng();
      this._bounce(options, endCallback);
    },

    _bounce(options, endCallback) {
      if (typeof options === 'function') {
        endCallback = options;
        options = null;
      }
      options = options || { duration: 1000, height: -1 };

      // backward compatibility
      if (typeof options === 'number') {
        options.duration = arguments[0];
        options.height = arguments[1];
      }

      // Keep original map center
      this._origMapCenter = this._map.project(this._map.getCenter());
      this._dropPoint = this._getDropPoint(options.height);
      this._bounceMotion(options.duration, endCallback);
    },

    // This will get you a drop point given a height.
    // If no height is given, the top y will be used.
    _getDropPoint(height) {
      // Get current coordidates in pixel
      this._point = this._toPoint(this._origLatlng);
      let top_y;
      if (height === undefined || height < 0) {
        top_y = this._toPoint(this._map.getBounds()._northEast).y;
      } else {
        top_y = this._point.y - height;
      }
      return new L.Point(this._point.x, top_y);
    },

    onAdd(map) {
      this._map = map;
      // Keep original latitude and longitude
      this._origLatlng = this._latlng;

      // We need to have our drop point BEFORE adding the marker to the map
      // otherwise, it would create a flicker. (The marker would appear at final
      // location then move to its drop location, and you may be able to see it.)
      if (this.options.bounceOnAdd === true) {
        // backward compatibility
        if (typeof this.options.bounceOnAddDuration !== 'undefined') {
          this.options.bounceOnAddOptions.duration = this.options.bounceOnAddDuration;
        }

        // backward compatibility
        if (typeof this.options.bounceOnAddHeight !== 'undefined') {
          this.options.bounceOnAddOptions.height = this.options.bounceOnAddHeight;
        }

        this._dropPoint = this._getDropPoint(this.options.bounceOnAddOptions.height);
        this.setLatLng(this._toLatLng(this._dropPoint));
      }

      // Call leaflet original method to add the Marker to the map.
      originalOnAdd.call(this, map);

      if (this.options.bounceOnAdd === true) {
        this._bounce(this.options.bounceOnAddOptions, this.options.bounceOnAddCallback);
      }
    },

    onRemove(map) {
      clearInterval(this._intervalId);
      originalOnRemove.call(this, map);
    },
  });
}());

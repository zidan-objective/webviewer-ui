import { useEffect, useState } from "react";

export function useTabbing() {
  const [isUserTabbing, setIsUserTabbing] = useState(observable.isUserTabbing);

  useEffect(() => {
    const setTabbing = () => setIsUserTabbing(observable.isUserTabbing);
    return observable.subscribe(setTabbing);
  }, []);

  return isUserTabbing;
}

const observable = new (class UserTabbingObservable {
  constructor() {
    this._subscribers = [];
    this.isUserTabbing = false;
  }

  subscribe(subscriber) {
    // If adding first subscriber, begin listening to window.
    if (this._subscribers.length === 0) {
      if (this.isUserTabbing) {
        this._tabToMouseListener();
      } else {
        this._mouseToTabListener();
      }
    }
    const exists = this._subscribers.includes(subscriber);
    if (!exists) {
      this._subscribers.push(subscriber);
    }
    return this._unsubscribe(subscriber);
  }

  _unsubscribe(subscriber) {
    return () => {
      this._subscribers = this._subscribers.filter(s => s !== subscriber);
      // If no subscribers, stop listening to window.
      if (this._subscribers.length === 0) {
        this._removeAllListeners();
      }
    };
  }

  _setIsUserTabbing(isUserTabbing) {
    this.isUserTabbing = isUserTabbing;
    this._subscribers.forEach(subscriber => subscriber());
  }

  _handleFirstTab = event => {
    if (event.key === "Tab") {
      this._setIsUserTabbing(true);
      this._tabToMouseListener();
    }
  };

  _handleFirstMouse = () => {
    this._setIsUserTabbing(false);
    this._mouseToTabListener();
  };

  _tabToMouseListener() {
    window.removeEventListener("keydown", this._handleFirstTab);
    window.addEventListener("mousedown", this._handleFirstMouse);
  }

  _mouseToTabListener() {
    window.removeEventListener("mousedown", this._handleFirstMouse);
    window.addEventListener("keydown", this._handleFirstTab);
  }

  _removeAllListeners() {
    window.removeEventListener("mousedown", this._handleFirstMouse);
    window.removeEventListener("keydown", this._handleFirstTab);
  }
})();

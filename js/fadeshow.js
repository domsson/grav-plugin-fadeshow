function Fadeshow(o)
{
	// options
	this.attr          = this.get_opt(o, "attribute", "data-fadeshow");
	this.name          = this.get_opt(o, "name", null);
	this.slider_class  = this.get_opt(o, "slider_class", "fadeshow");
	this.slide_sel     = this.get_opt(o, "slide_selector", null);
	this.slide_class   = this.get_opt(o, "slide_class", "fadeshow-slide");
	this.slide_active  = this.get_opt(o, "slide_active", "active");
	this.slide_hidden  = this.get_opt(o, "slide_hidden", "hidden");
	this.nav_class     = this.get_opt(o, "nav_class", "fadeshow-nav");
	this.button_class  = this.get_opt(o, "button_class", "fadeshow-button");
	this.button_active = this.get_opt(o, "button_active", "active");
	this.duration      = this.get_opt(o, "duration", 5);
	this.add_nav       = this.get_opt(o, "add_nav", false);

	// state
	this.slider  = null;
	this.nav     = null;
	this.slides  = [];
	this.buttons = [];
	this.current = -1;
	this.sliding = false;
	this.timer   = null;
	this.paused  = false;
	this.hover_handler = null;
};

Fadeshow.prototype.get_opt = function(o, p, d)
{
	return o && o.hasOwnProperty(p) ? o[p] : d;
};

/*
 * Add the given CSS class to the given element. If the given class is falsy 
 * (for example `null` or an empty string), this function does nothing.
 */
Fadeshow.prototype.add_class = function(e, c) {
	e && c && e.classList.add(c);
};

/*
 * Remove the given CSS class to the given element. If the given class is falsy
 * (for example `null` or an empty string), this function does nothing.
 */
Fadeshow.prototype.rem_class = function(e, c) {
	e && c && e.classList.remove(c);
};

Fadeshow.prototype.button = function(evt)
{
	let i = parseInt(evt.currentTarget.getAttribute("data-slide-idx"));
	return (i == this.current) || this.show(i);
};

Fadeshow.prototype.init = function()
{
	if (!this.slider)
	{
		this.slider = this.find_by_attr(this.attr, this.name);
	}
	if (!this.slider) 
	{
		return false;
	}
	this.add_class(this.slider, this.slider_class);

	var slides = this.find_slides();
	for (var i = 0; i < slides.length; ++i)
	{
		this.add_class(slides[i], this.slide_class);
		this.slides.push(slides[i]);
	}

	if (this.slides.length == 0)
	{
		return false;
	}

	if (this.add_nav)
	{
		this.make_nav();
	}

	this.hide_all();
	this.show(this.current = 0);

	this.hover_handler = this.on_hover.bind(this);
	this.slider.addEventListener("mouseover", this.hover_handler);
	this.slider.addEventListener("mouseout",  this.hover_handler);

	if (this.duration)
	{
		var next_handler = this.on_timer.bind(this);
		this.timer = window.setInterval(next_handler, this.duration * 1000);
	}

	this.slider.setAttribute(this.attr + "-set", "");
};

Fadeshow.prototype.find_by_attr = function(name, value)
{
	var q = '['+ name + '="' + (value ? value : "") + '"]';
	var matches = document.querySelectorAll(q);
	for (var i = 0; i < matches.length; ++i) {
		if (!matches[i].hasAttribute(name + "-set")) {
			return matches[i];
		}		
	}
	// Nothing found, return null
	return null;
};

Fadeshow.prototype.find_slides = function()
{
	return this.slide_sel ?	this.slider.querySelectorAll(this.slide_sel) : 
		this.slider.children;
};
	
Fadeshow.prototype.make_nav = function()
{
	var nav = document.createElement("ul");
	nav.classList.add(this.nav_class);
	var handler = this.button.bind(this);	

	for (var i = 0; i < this.slides.length; ++i)
	{
		var btn = document.createElement("li");
		btn.setAttribute("data-slide-idx", i);
		this.add_class(btn, this.button_class);
		btn.addEventListener("click", handler);
		var txt = document.createElement("span");
		txt.innerHTML = (i + 1);
		btn.appendChild(txt);
		nav.appendChild(btn);
		this.buttons.push(btn);
	}
	this.slider.appendChild(nav);
	this.nav = nav;
};

Fadeshow.prototype.on_hover = function(evt)
{
	if (evt.currentTarget != this.slider)
	{
		return;
	}
	this.paused = (event.type == "mouseover");
};

Fadeshow.prototype.on_timer = function(evt)
{
	return this.paused || this.next();
};

Fadeshow.prototype.prev = function()
{
	var prev = this.current == 0 ? this.slides.length - 1 : this.current - 1;
	return this.show(prev);
};

Fadeshow.prototype.next = function()
{
	var next = (this.current == this.slides.length - 1) ? 0 : this.current + 1;
	return this.show(next);
};

Fadeshow.prototype.show = function(idx)
{
	if (this.sliding)
	{
		return false;
	}
	if (idx < 0 || idx >= this.slides.length)
	{
		return false;
	}

	this.sliding = true;
	this.hide(this.current);

	this.rem_class(this.slides[idx], this.slide_hidden);
	this.add_class(this.slides[idx], this.slide_active);
	this.add_class(this.buttons[idx], this.button_active);
	
	this.current = idx;
	this.sliding = false;
	return true;
};

Fadeshow.prototype.hide = function(idx)
{
	this.rem_class(this.slides[idx], this.slide_active);
	this.add_class(this.slides[idx], this.slide_hidden);
	this.rem_class(this.buttons[idx], this.button_active);
};

Fadeshow.prototype.hide_all = function()
{
	for (var i = 0; i < this.slides.length; ++i)
	{
		this.hide(i);
	}
};

Fadeshow.prototype.kill = function()
{
	// remove classes/attributes
	// note: no need to remove nav/button classes,
	//       as the entire nav will be removed from DOM
	this.rem_class(this.slider, this.slider_class);
	this.slider.removeAttribute(this.attr + "-set");
	for (var i = 0; i < this.slides.length; ++i)
	{
		this.rem_class(this.slides[i], this.slide_class);
		this.rem_class(this.slides[i], this.slide_active);
		this.rem_class(this.slides[i], this.slide_hidden);
	}

	// remove event listeners
	// note: no need to remove button listeners,
	//       as the entire nav will be removed from DOM
	this.slider.removeEventListener("mouseover", this.hover_handler);
	this.slider.removeEventListener("mouseout", this.hover_handler);

	// remove/halt timer/interval
	clearInterval(this.timer);

	// remove slider nav from DOM
	this.slider.removeChild(this.nav);

	// reset state vars
	// note: we do not reset this.slider, so we can re-initialize
	//       this fadeshow instance at any time, if so requested
	this.slides  = [];
	this.nav     = null;
	this.buttons = [];
	this.current = -1;
	this.sliding = false;
	this.timer   = null;
	this.paused  = false;
	this.hover_handler = null;
};

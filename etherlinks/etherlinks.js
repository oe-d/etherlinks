// EtherLinks 1.0.0
// https://github.com/oe-d/etherlinks

let page;
const buttons = [];
const elements = {
    parent: null,
    container: null,
    buttons: [],
    tooltips: []
};

function get_page() {
    if (window.location.pathname.substr(1, 7) == 'address') {
        const icon = document.getElementById('icon');

        if (icon) {
            if (icon.nextElementSibling.textContent.includes('Address')) {
                return 'address';
            } else if (icon.nextElementSibling.textContent.includes('Contract')) {
                return 'contract';
            }
        }
    } else if (window.location.pathname.substr(1, 5) == 'token') {
        return 'token';
    }

    return false;
}

function get_parent_element() {
    if (page == 'token') {
        return document.getElementsByClassName('fs-base fw-medium')[0].parentElement;
    } else {
        return document.getElementById('ContentPlaceHolder1_copyButtonPanel').parentElement;
    }
}

function get_url(site) {
    const address = window.location.href.substr(window.location.href.search('0x'), 42);

    switch (site) {
        case 'blur':
            return 'https://blur.io/' + (page == 'address' ? '' : 'collection/') + address;
        case 'gem':
            return 'https://gem.xyz/' + (page == 'address' ? 'profile/' : 'collection/') + address;
        case 'looksrare':
            return 'https://looksrare.org/' + (page == 'address' ? 'accounts/' : 'collections/') + address;
        case 'opensea':
            return 'https://' + (window.location.href.match(/goerli/) ? 'testnets.' : '') + 'opensea.io/' + (page == 'address' ? '' : 'assets?search[query]=') + address;
        case 'x2y2':
            return 'https://x2y2.io/' + (page == 'address' ? 'user/' : 'collection/') + address + (page == 'address' ? '/items' : '');
    }
}

function create_buttons() {
    buttons.push({ url: get_url('opensea'), img: 'images/opensea-grayscale.svg', img_hover: 'images/opensea.svg', tooltip: 'OpenSea' });
    buttons.push({ url: get_url('looksrare'), img: 'images/looksrare-grayscale.svg', img_hover: 'images/looksrare.svg', tooltip: 'LooksRare' });
    buttons.push({ url: get_url('x2y2'), img: 'images/x2y2-grayscale.svg', img_hover: 'images/x2y2.svg', tooltip: 'X2Y2' });
    buttons.push({ url: get_url('blur'), img: 'images/blur-grayscale.svg', img_hover: 'images/blur.svg', tooltip: 'Blur' });
    buttons.push({ url: get_url('gem'), img: 'images/gem-grayscale.svg', img_hover: 'images/gem.svg', tooltip: 'Gem' });
}

function is_unread() {
    const el = elements.parent.getElementsByClassName('visually-hidden');

    if (el.length && el[0].textContent.includes('unread')) {
        return true;
    }

    return false;
}

function create_container_element() {
    elements.container = document.createElement('div');
    elements.container.setAttribute('id', 'EtherLinks');
    elements.container.setAttribute('class', 'd-inline-flex align-items-center gap-2' + (page == 'token' ? ' ms-2' : (is_unread() ? ' ms-5' : ' ms-3')));
    elements.parent.appendChild(elements.container);
}

function create_button_elements() {
    for (i = 0; i < buttons.length; i++) {
        elements.buttons.push({ a: document.createElement('a') });
        elements.buttons[i].a.setAttribute('index', i);
        elements.buttons[i].a.setAttribute('class', page == 'token' ? '' : 'mt-n1');
        elements.buttons[i].a.setAttribute('href', buttons[i].url);
        elements.buttons[i].a.addEventListener('mouseover', set_attributes, event);
        elements.buttons[i].a.addEventListener('mouseleave', set_attributes, event);
        elements.container.appendChild(elements.buttons[i].a);

        elements.buttons[i].img = document.createElement('img');
        elements.buttons[i].img.setAttribute('width', '24');
        elements.buttons[i].img.setAttribute('class', page == 'token' ? '' : 'mt-n1');
        elements.buttons[i].img.setAttribute('src', chrome.runtime.getURL(buttons[i].img));
        elements.buttons[i].a.appendChild(elements.buttons[i].img);
    }
}

function create_tooltip_elements() {
    for (i = 0; i < buttons.length; i++) {
        elements.tooltips.push({ container: document.createElement('div') });
        elements.tooltips[i].container.setAttribute('class', 'tooltip bs-tooltip-auto fade');
        elements.tooltips[i].container.setAttribute('style', 'position: absolute;');
        elements.tooltips[i].container.setAttribute('data-popper-placement', 'top');
        document.body.appendChild(elements.tooltips[i].container);

        elements.tooltips[i].arrow = document.createElement('div');
        elements.tooltips[i].arrow.setAttribute('class', 'tooltip-arrow');
        elements.tooltips[i].arrow.setAttribute('style', 'position: absolute;');
        elements.tooltips[i].container.appendChild(elements.tooltips[i].arrow);

        elements.tooltips[i].text_container = document.createElement('div');
        elements.tooltips[i].text_container.setAttribute('class', 'tooltip-inner');
        elements.tooltips[i].text_container.textContent = buttons[i].tooltip;
        elements.tooltips[i].container.appendChild(elements.tooltips[i].text_container);
    }
}

function set_attributes(event) {
    const index = event.currentTarget.getAttribute('index');

    if (event.type == 'mouseover') {
        elements.buttons[index].img.setAttribute('src', chrome.runtime.getURL(buttons[index].img_hover));

        const tooltip_container_class = elements.tooltips[index].container.getAttribute('class');
        elements.tooltips[index].container.setAttribute('class', tooltip_container_class + ' show');

        const button_rect = elements.buttons[index].img.getBoundingClientRect();
        const tooltip_rect = elements.tooltips[index].container.getBoundingClientRect();
        const tooltip_arrow_rect = elements.tooltips[index].arrow.getBoundingClientRect();
        const tooltip_x = Math.round(button_rect.left + button_rect.width / 2 - tooltip_rect.width / 2);
        const tooltip_y = Math.round(button_rect.top - tooltip_rect.height - tooltip_arrow_rect.height / 3 + document.documentElement.scrollTop);
        elements.tooltips[index].container.setAttribute('style', 'position: absolute; transform: translate3d(' + tooltip_x + 'px, ' + tooltip_y + 'px, 0px);');

        const tooltip_arrow_x = tooltip_rect.width / 2 - tooltip_arrow_rect.width / 2;
        elements.tooltips[index].arrow.setAttribute('style', 'position: absolute; left: 0px; transform: translate3d(' + tooltip_arrow_x + 'px, 0px, 0px);');
    } else if (event.type == 'mouseleave') {
        elements.buttons[index].img.setAttribute('src', chrome.runtime.getURL(buttons[index].img));

        const tooltip_container_class = elements.tooltips[index].container.getAttribute('class');
        elements.tooltips[index].container.setAttribute('class', tooltip_container_class.substr(0, tooltip_container_class.search(' show')));
    }
}

(function () {
    page = get_page();

    if (!page) {
        return false;
    }

    elements.parent = get_parent_element();
    create_buttons();
    create_container_element();
    create_button_elements();
    create_tooltip_elements();
})();

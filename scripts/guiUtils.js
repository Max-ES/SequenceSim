function addInput(label, labelEnd, initialValue, onChangeCallback, parent = "gui") {
    // Get the parent element
    const gui = document.getElementById(parent);

    // Create a new div element for the input group
    const div = document.createElement('div');
    div.className = 'input-group mb-3';

    // Create the first span element for the label
    const spanLabel = document.createElement('span');
    spanLabel.className = 'input-group-text';
    spanLabel.textContent = label;

    // Create the input element
    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'form-control';
    input.id = label.replace(/\s+/g, '-').toLowerCase(); // Example to generate an id
    initialValue = getValue(label) ?? initialValue
    input.addEventListener('change', (evnt) => {
        storeValue(evnt, label)
        onChangeCallback(evnt);
    });
    input.value = initialValue;
    input.dispatchEvent(new Event('change', {target: {value: initialValue}}))

    // Create the second span element for the label end
    const spanLabelEnd = document.createElement('span');
    spanLabelEnd.className = 'input-group-text';
    spanLabelEnd.textContent = labelEnd;

    // Append the elements to the div
    div.appendChild(spanLabel);
    div.appendChild(input);
    if (labelEnd) div.appendChild(spanLabelEnd);

    // Append the div to the parent element
    gui.appendChild(div);
}

/**
 * Adds a toggle switch element
 * @param label The text for the label
 * @param isChecked Initial checked state of the toggle
 * @param onChangeCallback Function that is called when the toggle state changes
 * @param parent The parent element's ID where the toggle will be added
 */
function addToggle(label, isChecked, onChangeCallback, parent = "gui") {
    // Get the parent element
    const gui = document.getElementById(parent);

    // Create a new div element for the form-check
    const div = document.createElement('div');
    div.className = 'form-check form-switch';

    // Create the input element
    const input = document.createElement('input');
    input.className = 'form-check-input';
    input.type = 'checkbox';
    input.role = 'switch';
    input.id = label.replace(/\s+/g, '-').toLowerCase(); // Generate an id based on the label
    input.checked = getValue(label) ?? isChecked;
    input.addEventListener('change', () => {
        onChangeCallback(input.checked)
        storeValue(input.checked, label)
    });
    input.dispatchEvent(new Event('change'))

    // Create the label element
    const labelElement = document.createElement('label');
    labelElement.className = 'form-check-label';
    labelElement.htmlFor = input.id;
    labelElement.textContent = label;

    // Append the input and label to the div
    div.appendChild(input);
    div.appendChild(labelElement);

    // Append the div to the parent element
    gui.appendChild(div);
}

function storeValue(event, name) {
    const v = typeof event === "boolean" ? event : event.target.value
    window.localStorage.setItem(name, v)
}

function getValue(name) {
    const v = window.localStorage.getItem(name)
    if (v === "true") return true
    if (v === "false") return false
    return v

}

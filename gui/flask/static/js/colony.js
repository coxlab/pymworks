/*
 * This exposes a global mworks object
 */

var animal = function (cfg) {
    var animal = {};
    attrs = {
        host: '127.0.0.1',
        port: undefined,
        user: undefined,
        experiment_path: undefined,
        experiment_name: undefined,
        variableset: undefined,
        variableset_overwrite: false,
        datafile: undefined,
        datafile_overwrite: false,
        protocol: undefined,
        name: '',
        autoload_variableset: false,
        autosave_variableset: false,
        autosave_datafile: false,
        autoload_experiment: false,
        autoconnect: false,
        autostart: false,
    };
    
    if (!cfg) {
        cfg = {};
    };

    for (attr in attrs) {
        animal[attr] = ko.observable((attr in cfg ? cfg[attr] : attrs[attr]));
    };

    animal.to_config = function () {
        cfg = {};
        for (attr in attrs) {
            if (animal[attr]() !== undefined) {
                cfg[attr] = animal[attr]();
            };
        };
        return cfg;
    };

    animal.from_config = function (cfg) {
        for (attr in cfg) {
            animal[attr](cfg[attr]);
        };
    };

    return animal;
};


var colony = (function () {
    var colony = {};
    var undo_data = {};
    
    colony.animals = ko.observableArray();

    colony.add_animal = function (cfg) {
        colony.animals.push(animal(cfg));
        if (colony.selected() === undefined) {
            colony.select_animal(colony.animals()[colony.animals().length - 1]);
        };
    };

    colony.create_animal = function () {
        colony.add_animal({});
        colony.select_animal(colony.animals()[colony.animals().length - 1]);
    };

    colony.load_animal = function () {
        // load an animal (page, config...) from 'this'
        console.log({'load_animal': this});
        window.location = '/a/' + this.name();
    };

    colony.edit_animal = function () {
        colony.select_animal(this);
        $('#tabs').tabs('option', 'selected', 1);
    };

    colony.remove_animal = function () {
        console.log({'removing animal': this});
    };

    colony.save_animals = function () {
        console.log({'saving animals': colony.animals()});
        try {
            data = {};
            animals = colony.animals();
            for (ai in animals) {
                animal = animals[ai];
                n = animal['name']();
                // TODO check name, etc...
                data[n] = animal.to_config();
            };
            colony.data = data;
            data = $.toJSON(data);
            // post data to /save_animals
            console.log({'save_animals:data': data});
            $.getJSON('/save_animals', {'data': data}, colony.saved_animals_callback);
        } catch (error) {
            $.pnotify({title: 'Error saving animals', text: '' + error, type: 'error', hide: false});
        };
    };

    colony.saved_animals_callback = function () {};

    colony.selected = ko.observable();

    colony.select_experiment = function () {
        // will be overloaded by page to use appropriate jquery.filetree
    };

    colony.select_animal = function (animal) {
        colony.selected(animal);
        colony.undo_data = colony.selected().to_config();
    };

    colony.undo_edits = function () {
        colony.selected().from_config(colony.undo_data);
    };

    return colony;
}());
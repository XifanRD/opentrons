:og:description: How to choose the right Python API version for your protocol. 

.. _v2-versioning:

Versioning
==========

The Python Protocol API has its own versioning system, which is separate from the versioning system used for the robot software and the Opentrons App. This allows you to specify the API version that your protocol requires without worrying about what robot software versions it will work with.

Major and Minor Versions
------------------------

The API uses a major and minor version number and does not use patch version numbers. For instance, major version 2 and minor version 0 is written as ``2.0``. Versions are not decimal numbers, so ``2.10`` indicates major version 2 and minor version 10, which is 9 minor versions newer than ``2.1``. The Python Protocol API version will only increase based on changes that affect protocol behavior.

The major version of the API increases whenever there are significant structural or behavioral changes to protocols. For instance, major version 2 of the API was introduced because it required protocols to have a ``run`` function that takes a ``protocol`` argument rather than importing the ``robot``, ``instruments``, and ``labware`` modules. Protocols written with major version 1 of the API will not run without modification in major version 2. A similar level of structural change would require a major version 3. This documentation only deals with features found in major version 2 of the API; see the `archived version 1 documentation <https://docs.opentrons.com/v1/index.html>`_ for information on older protocols.

The minor version of the API increases whenever there is new functionality that might change the way a protocol is written, or when a behavior changes in one aspect of the API but does not affect all protocols. For instance, adding support for a new hardware module, adding new parameters for a function, or deprecating a feature would increase the minor version of the API.

Specifying Versions
-------------------

You must specify the API version you are targeting in the ``metadata`` block at the top of your Python protocol. Use the ``'apiLevel'`` key, alongside any other metadata elements:

.. code-block:: python
  :substitutions:

   from opentrons import protocol_api

   metadata = {
       'apiLevel': '|apiLevel|',
       'author': 'A. Biologist'}

   def run(protocol: protocol_api.ProtocolContext):
       protocol.comment('Hello, world!')


Version specification is required by the system. If you do not specify a target API version, you will not be able to simulate or run your protocol.

The version you specify determines the features and behaviors available to your protocol. For example, support for the Heater-Shaker Module was added in version 2.13, so you can't specify a lower version and then call ``HeaterShakerContext`` methods without causing an error. This protects you from accidentally using features not present in your specified API version, and keeps your protocol portable between API versions.

When choosing an API level, consider what features you need and how widely you plan to share your protocol. On the one hand, using the highest available version will give your protocol access to all the latest :ref:`features and fixes <version-notes>`. On the other hand, using the lowest possible version lets the protocol work on a wider range of robot software versions. For example, a protocol that uses the Heater-Shaker and specifies version 2.13 of the API should work equally well on a robot running version 6.1.0 or 6.2.0 of the robot software. Specifying version 2.14 would limit the protocol to robots running 6.2.0 or higher.

.. note::

    Python protocols with an ``apiLevel`` of 2.14 can't currently be simulated with the ``opentrons_simulate`` command-line tool, the :py:func:`opentrons.simulate.simulate` function, or the :py:func:`opentrons.simulate.get_protocol_api` function. If your protocol doesn't rely on new functionality added in version 2.14, use a lower ``apiLevel``. For protocols that require 2.14, analyze your protocol with the Opentrons App instead.


Maximum Supported Versions
--------------------------

From version 3.15.0 to 5.0.2 of the OT-2 software and Opentrons App, the maximum supported API level was listed in the robot's **Information** card in the app. Since version 6.0.0, the same information is listed under **Robot Settings > Advanced**.

If you upload a protocol that specifies a higher API level than the maximum supported by your OT-2, it won't be able to analyze or run your protocol. You may be able to increase the maximum supported version by updating your OT-2 to the latest robot software and Opentrons App. All OT-2 hardware is capable of running protocols specifying any minor version of the API v2, as long as its software is up to date.


Added Features
--------------

Throughout the Python Protocol API documentation, there are version statements indicating when elements (features, function calls, available properties, etc.) were introduced. Keep these in mind when specifying your protocol's API version. Version statements look like this:

.. versionadded:: 2.0


.. _version-table:

API and Robot Software Versions
-------------------------------

This table lists the correspondence between Protocol API versions and robot software versions.

+-------------+------------------------------+
| API Version | Introduced in Robot Software |
+=============+==============================+
|     1.0     |           3.0.0              |
+-------------+------------------------------+
|     2.0     |          3.14.0              |
+-------------+------------------------------+
|     2.1     |          3.15.2              |
+-------------+------------------------------+
|     2.2     |          3.16.0              |
+-------------+------------------------------+
|     2.3     |          3.17.0              |
+-------------+------------------------------+
|     2.4     |          3.17.1              |
+-------------+------------------------------+
|     2.5     |          3.19.0              |
+-------------+------------------------------+
|     2.6     |          3.20.0              |
+-------------+------------------------------+
|     2.7     |          3.21.0              |
+-------------+------------------------------+
|     2.8     |          4.0.0               |
+-------------+------------------------------+
|     2.9     |          4.1.0               |
+-------------+------------------------------+
|     2.10    |          4.3.0               |
+-------------+------------------------------+
|     2.11    |          4.4.0               |
+-------------+------------------------------+
|     2.12    |          5.0.0               |
+-------------+------------------------------+
|     2.13    |          6.1.0               |
+-------------+------------------------------+
|     2.14    |          6.3.0               |
+-------------+------------------------------+

.. _version-notes:

Changes in API Versions
-----------------------

Version 2.0
+++++++++++

Version 2 of the API is a new way to write Python protocols, with support for new modules like the Thermocycler. To transition your protocols from version 1 to version 2 of the API, follow this `migration guide <http://support.opentrons.com/en/articles/3425727-switching-your-protocols-from-api-version-1-to-version-2>`_.

We've also published a `more in-depth discussion <http://support.opentrons.com/en/articles/3418212-opentrons-protocol-api-version-2>`_ of why we developed version 2 of the API and how it differs from version 1.


Version 2.1
+++++++++++

- When loading labware onto a module, you can now specify a label with the ``label`` parameter of
  :py:meth:`.MagneticModuleContext.load_labware`,
  :py:meth:`.TemperatureModuleContext.load_labware`, or
  :py:meth:`.ThermocyclerContext.load_labware`,
  just like you can when loading labware onto the deck with :py:meth:`.ProtocolContext.load_labware`.


Version 2.2
+++++++++++

- You should now specify Magnetic Module engage height using the
  ``height_from_base`` parameter, which specifies the height of the top of the
  magnet from the base of the labware. For more, see :ref:`magnetic-module-engage`.
- Return tip will now use pre-defined heights from hardware testing. For more information, see :ref:`pipette-return-tip`.
- When using the return tip function, tips are no longer added back into the tip tracker. For more information, see :ref:`pipette-return-tip`.


Version 2.3
+++++++++++

- Magnetic Module GEN2 and Temperature Module GEN2 are now supported; you can load them with the names ``"magnetic
  module gen2"`` and ``"temperature module gen2"``, respectively.
- All pipettes will return tips to tip racks from a higher position to avoid
  possible collisions.
- During a :ref:`mix`, the pipette will no longer move up to clear the liquid in
  between every dispense and following aspirate.
- You can now access the Temperature Module's status via :py:obj:`.TemperatureModuleContext.status`.


Version 2.4
+++++++++++

- The following improvements were made to the ``touch_tip`` command:

  - The speed for ``touch_tip`` can now be lowered down to 1 mm/s
  - ``touch_tip`` no longer moves diagonally from the X direction -> Y direction
  - Takes into account geometry of the deck and modules


Version 2.5
+++++++++++

- New :ref:`new-utility-commands` were added:

  - :py:meth:`.ProtocolContext.set_rail_lights`: turns robot rail lights on or off
  - :py:obj:`.ProtocolContext.rail_lights_on`: describes whether or not the rail lights are on
  - :py:obj:`.ProtocolContext.door_closed`: describes whether the robot door is closed


Version 2.6
+++++++++++

- GEN2 Single pipettes now default to flow rates equivalent to 10 mm/s plunger
  speeds

  - Protocols that manually configure pipette flow rates will be unaffected

  - For a comparison between API Versions, see :ref:`defaults`


Version 2.7
+++++++++++

- Added :py:meth:`.InstrumentContext.pair_with`, an experimental feature for moving both pipettes simultaneously.

  .. note::

      This feature has been removed from the Python Protocol API.

- Calling :py:meth:`.InstrumentContext.has_tip` will return whether a particular instrument
  has a tip attached or not.


Version 2.8
+++++++++++

- You can now pass in a list of volumes to distribute and consolidate. See :ref:`distribute-consolidate-volume-list` for more information.

  - Passing in a zero volume to any :ref:`v2-complex-commands` will result in no actions taken for aspirate or dispense

- :py:meth:`.Well.from_center_cartesian` can be used to find a point within a well using normalized distance from the center in each axis.

  - Note that you will need to create a location object to use this function in a protocol. See :ref:`protocol-api-labware` for more information.

- You can now pass in a blowout location to transfer, distribute, and consolidate
  with the ``blowout_location`` parameter. See :py:meth:`.InstrumentContext.transfer` for more detail!


Version 2.9
+++++++++++

- You can now access certain geometry data regarding a labware's well via a Well Object. See :ref:`new-labware-well-properties` for more information.


Version 2.10
++++++++++++

- Moving to the same well twice in a row with different pipettes no longer results in strange diagonal movements.


Version 2.11
++++++++++++

- Attempting to aspirate from or dispense to tip racks will raise an error.


Version 2.12
++++++++++++

- :py:meth:`.ProtocolContext.resume` has been deprecated.
- :py:meth:`.Labware.set_offset` has been added to apply labware offsets to protocols run (exclusively) outside of the Opentrons App (Jupyter Notebook and SSH).


Version 2.13
++++++++++++

- Adds :py:class:`.HeaterShakerContext` to support the Heater-Shaker Module. You can use the load name ``heaterShakerModuleV1`` with :py:meth:`.ProtocolContext.load_module` to add a Heater-Shaker to a protocol.
- :py:meth:`.InstrumentContext.drop_tip` now has a ``prep_after`` parameter.
- :py:meth:`.InstrumentContext.home` may home *both* pipettes as needed to avoid collision risks.
- :py:meth:`.InstrumentContext.aspirate` and :py:meth:`.InstrumentContext.dispense` will avoid interacting directly with modules.


Version 2.14
++++++++++++

This version introduces a new protocol runtime that offers more reliable run control
and builds a strong foundation for future Protocol API improvements.

Several older parts of the Protocol API were deprecated as part of this switchover.
If you specify an API version of ``2.13`` or lower, your protocols will continue to execute on the old runtime.

- Feature additions

  - :py:meth:`.ProtocolContext.define_liquid` and :py:meth:`.Well.load_liquid` added
    to define different liquid types and add them to wells, respectively.

- Bug fixes

  - :py:class:`.Labware` and :py:class:`.Well` now adhere to the protocol's API level setting.
    Prior to this version, they incorrectly ignored the setting.

  - :py:meth:`.InstrumentContext.touch_tip` will end with the pipette tip in the center of the well
    instead of on the edge closest to the front of the machine.

  - :py:meth:`.ProtocolContext.load_labware` now prefers loading user-provided labware definitions
    rather than built-in definitions if no explicit ``namespace`` is specified.

  - :py:meth:`.ProtocolContext.pause` will now properly wait until you resume the protocol before moving on.
    In previous versions, the run will not pause until the first call to a different ``ProtocolContext`` method.

  - Motion planning has been improved to avoid certain erroneous downward movements,
    especially when using :py:meth:`.InstrumentContext.aspirate`.

  - :py:meth:`.Labware.reset` and :py:attr:`.Labware.tip_length` will raise useful errors if called on labware that is not a tip rack.

- Removals

  - The ``presses`` and ``increment`` arguments of  :py:meth:`.InstrumentContext.pick_up_tip` were deprecated.
    Configure your pipette pick-up settings with the Opentrons App, instead.

  - ``InstrumentContext.speed`` property was removed.
    This property tried to allow setting a pipette's **plunger** speed in mm/s.
    However, it could only approximately set the plunger speed,
    because the plunger's speed is a stepwise function of the volume.
    Use :py:attr:`.InstrumentContext.flow_rate` to set the flow rate in µL/s, instead.

  - ``ModuleContext.load_labware_object`` was removed as an unnecessary internal method.

  - ``ModuleContext.geometry`` was removed in favor of
    :py:attr:`.ModuleContext.model` and :py:attr:`.ModuleContext.type`

  - ``Well.geometry`` was removed as unnecessary.

  - ``MagneticModuleContext.calibrate`` was removed since it was never needed nor implemented.

  - The ``height`` parameter of :py:meth:`.MagneticModuleContext.engage` was removed.
    Use ``offset`` or ``height_from_base`` instead.
    
  - ``Labware.separate_calibration`` and :py:meth:`.Labware.set_calibration` were removed,
    since they were holdovers from a calibration system that no longer exists.

  - Various methods and setters were removed that could modify tip state outside of
    calls to :py:meth:`.InstrumentContext.pick_up_tip` and :py:meth:`.InstrumentContext.drop_tip`.
    This change allows the robot to track tip usage more completely and reliably.
    You may still use :py:meth:`.Labware.reset` and :py:meth:`.InstrumentContext.reset_tipracks`
    to reset your tip racks' state.

      - The :py:attr:`.Well.has_tip` **setter** was removed. **The getter is still supported.**

      - Internal methods ``Labware.use_tips``, ``Labware.previous_tip``, and ``Labware.return_tips``
        were removed.

  - The ``configuration`` argument of :py:meth:`.ProtocolContext.load_module` was removed
    because it made unsafe modifications to the protocol's geometry system,
    and the Thermocycler's "semi" configuration is not officially supported.

- Known limitations

  - :py:meth:`.Labware.set_offset` is not yet supported on this API version.
    Run protocols via the Opentrons App, instead.

  - :py:attr:`.ProtocolContext.max_speeds` is not yet supported on the API version.
    Use :py:attr:`.InstrumentContext.default_speed` or the per-method `speed` argument, instead.

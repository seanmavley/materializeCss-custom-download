#About Custom Materialize Download

This website allows you to customize your [MaterializeCSS](http://materializecss.com) before you download based on the most stable version.

Check the Sass modules you wish to download and use in your project and press the "Download Custom" button.

## Which Materialize Version
Any custom CSS downloaded from here is from the latest stable release of MaterializeCSS. A cron task updates the local repo everyday, ensuring your custom builds are always the freshes, latest and most stable.

## What Modules are included by default?
By default, the packages below are added to every custom build you make. Without them, the build might break. 

Default included modules are:
```
 @import "components/prefixer";
 @import "components/mixins";
 @import "components/color";
 @import "components/variables";
 @import "components/normalize";
 @import "components/global";
 @import "components/icons-material-design";
 @import "components/typography";
```

Any additional checkboxes will be added to the above variables.

## Why are Custom Builds important?
Minimal features and file size. Perhaps you are interested in using Material Design for a your site, but do not want anything else. Building specifically to target these needs ensures you end up with a minimal file size, and less CSS conflicts within your project.

I always enjoy using [Foundation for Sites Custom project downloader](http://foundation.zurb.com/sites/download.html). I enjoy using Materialize CSS, so in order to help me build custom CSS files easily for my projects in a GUI manner, I 'Weekend-thon' this Material Custom website.

Read about the making of the [Custom MaterializeCSS Download site](https://blog.khophi.co/customize-materializecss-before-download-browser/)

I hope you find this useful. Any feedback or feature requests? Please email me at hello@khophi.co

# TODO
 - Ensure can't submit with only minify checked.
 - Write tests

# License
See the LICENSE file
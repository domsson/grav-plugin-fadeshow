<?php
namespace Grav\Plugin;

use Composer\Autoload\ClassLoader;
use Grav\Common\Plugin;
use RocketTheme\Toolbox\Event\Event;

/**
 * Class FadeshowPlugin
 * @package Grav\Plugin
 */
class FadeshowPlugin extends Plugin
{
    /**
     * @return array
     *
     * The getSubscribedEvents() gives the core a list of events
     *     that the plugin wants to listen to. The key of each
     *     array section is the event that the plugin listens to
     *     and the value (in the form of an array) contains the
     *     callable (or function) as well as the priority. The
     *     higher the number the higher the priority.
     */
    public static function getSubscribedEvents()
    {
        return [
            'onPluginsInitialized' => ['onPluginsInitialized', 0],
            'onTwigTemplatePaths' => ['onTwigTemplatePaths', 0]
        ];
    }

    /**
     * Composer autoload.
     * @return ClassLoader
     */
    public function autoload(): ClassLoader
    {
        return require __DIR__ . '/vendor/autoload.php';
    }

    /**
     * Add current directory to twig lookup paths.
     */
    public function onTwigTemplatePaths()
    {
        $this->grav['twig']->twig_paths[] = __DIR__ . '/templates';
    }

    /**
     * Initialize the plugin
     */
    public function onPluginsInitialized()
    {
	$this->active = $this->config->get('plugins.'. $this->name .'.active');

        if ($this->isAdmin()) {
            $this->enable([
                'onGetPageBlueprints' => ['onGetPageBlueprints', 0]
            ]);
        }

        elseif ($this->active) {
            $this->enable([
                'onTwigSiteVariables' => ['onTwigSiteVariables', 0]
            ]);
        }
    }

    /**
     * Load JS and CSS assets.
     */
    public function onTwigSiteVariables()
    {
        $config = $this->config->get('plugins.'. $this->name);

	// Add built-in JS
	$this->grav['assets']->addJs('plugin://'. $this->name .'/js/'. $this->name .'.js');
	
	// Add built-in CSS, if we're supposed to according to the config
	if ($config['built_in_css']) {
		$this->grav['assets']->addCss('plugin://'. $this->name .'/css/'. $this->name .'.css');
	}
    }

    /**
     * Add blueprint directory.
     */
    public function onGetPageBlueprints(Event $event)
    {
        $event->types->scanBlueprints('plugin://'. $this->name .'/blueprints');
    }
}

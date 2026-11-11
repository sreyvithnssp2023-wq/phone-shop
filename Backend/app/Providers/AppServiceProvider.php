<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Auto-switch to SQLite if MySQL is unreachable or not running
        $defaultConn = Config::get('database.default');
        if ($defaultConn === 'mysql') {
            $host = Config::get('database.connections.mysql.host', '127.0.0.1');
            $port = (int) Config::get('database.connections.mysql.port', 3306);
            $sqlitePath = database_path('database.sqlite');

            // Fast 1s non-blocking socket probe to prevent 60s PDO connection hangs
            $isMysqlReachable = false;
            $fp = @fsockopen($host, $port, $errno, $errstr, 1);
            if ($fp) {
                $isMysqlReachable = true;
                fclose($fp);
            }

            if (!$isMysqlReachable && file_exists($sqlitePath)) {
                Config::set('database.default', 'sqlite');
                Config::set('database.connections.sqlite.database', $sqlitePath);
                DB::purge('mysql');
                DB::purge('sqlite');
                DB::setDefaultConnection('sqlite');
            }
        }
    }
}

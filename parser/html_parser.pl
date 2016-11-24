#!/usr/local/bin/perl

use strict;
use warnings;
use feature 'say';
use HTML::TokeParser::Simple;

my $parser = HTML::TokeParser::Simple->new(handle => *DATA);

while (my $anchor = $parser->get_tag('a')) {
    next unless defined(my $href = $anchor->get_attr('href'));
    say $href;
}

__DATA__
<html><body>

<p><a href="http://example.com/">An Example</a></p>

<!-- <a href="http://invalid.example.com/">An Example</a> -->
</body></html>

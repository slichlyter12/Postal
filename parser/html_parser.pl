#!/usr/local/bin/perl

use strict;
use warnings;
use feature 'say';
use HTML::TokeParser::Simple;

my $anchor_parser = HTML::TokeParser::Simple->new(handle => *DATA);

while (my $anchor = $anchor_parser->get_tag('a')) {
    next unless defined(my $href = $anchor->get_attr('href'));
    say $href;
}


my $image_parser = HTML::TokeParser::Simple->new(handle => *DATA);

while (my $source = $image_parser->get_tag('img')) {
    next unless defined(my $src = $source->get_attr('src'));
    say $src;
}

__DATA__
<!DOCTYPE html>
<html>

<head>
<title>Hello Perl!</title>
</head>

<body>

<p><a href="http://example.com/">An Example</a></p>
<img src="../img/perl.png" alt="perl icon" height="42" width="42">
<img src="../img/python.png" alt="perl icon" height="42" width="42">
<img src="../img/cpp.png" alt="perl icon" height="42" width="42">

<a href="http://invalid.example.com/">An Example</a>
</body></html>

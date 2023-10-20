package main

import (
	"fmt"
	"os"
	"sort"
	"strings"

	"github.com/dustin/go-humanize"
	"github.com/gocolly/colly/v2"
)

var blocked = []string{
	"/orgs",
	"/site",
	"/topics",
	"/about",
	"/readme",
	"/login",
	"/signup",
	"/features",
	"/trending",
	"/enterprise",
	"/customer-stories",
	"/roadmap",
}

type Repo struct {
	url  string
	star int64
}

func main() {
	_ = os.Mkdir(".cache", os.ModePerm)

	c := colly.NewCollector(colly.AllowedDomains("github.com"), colly.CacheDir((".cache")))

	var repos []Repo

	// Find and visit all links
	c.OnHTML("a[data-hovercard-type=repository]", func(e *colly.HTMLElement) {

		nextUrl := e.Attr("href")

		for _, b := range blocked {
			if strings.Contains(nextUrl, b) {
				return
			}
		}

		e.Request.Visit(nextUrl)
	})

	// Find and visit all links
	c.OnHTML(".paginate-container a[href]", func(e *colly.HTMLElement) {

		nextUrl := e.Attr("href")

		if strings.Contains(nextUrl, "dependents_before") {
			return
		}

		for _, b := range blocked {
			if strings.Contains(nextUrl, b) {
				return
			}
		}

		e.Request.Visit(nextUrl)
	})

	c.OnHTML("#repo-stars-counter-star", func(e *colly.HTMLElement) {
		fmt.Println(e.Request.URL, ": Star = ", e.DOM.Text())

		star, _, _ := humanize.ParseSI(e.DOM.Text())

		repos = append(repos, Repo{
			url:  e.Request.URL.String(),
			star: int64(star),
		})
	})

	c.OnRequest(func(r *colly.Request) {
		fmt.Println("Visiting", r.URL)
	})

	c.Visit("https://github.com/swc-project/swc/network/dependents?dependent_type=PACKAGE&package_id=UGFja2FnZS00Njc1MTk4MDQ%3D")
	// c.Visit("https://github.com/parcel-bundler/parcel/network/dependents?dependent_type=REPOSITORY&package_id=UGFja2FnZS0yOTE0Mjg3MjM4")

	sort.Sort(sort.Reverse(ByStar(repos)))

	for _, repo := range repos {
		fmt.Println(repo.url, repo.star)
	}

}

type ByStar []Repo

func (a ByStar) Len() int           { return len(a) }
func (a ByStar) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a ByStar) Less(i, j int) bool { return a[i].star < a[j].star }
